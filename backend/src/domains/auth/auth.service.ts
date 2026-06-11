import {
  ForgotPasswordDto,
  forgotPasswordSchema,
  LoginUserDto,
  loginUserSchema,
  ResetPasswordDto,
  resetPasswordSchema,
  UserDto,
} from '@app/shared';
import bcrypt from 'bcrypt';
import { tokenService } from './token.service';
import { prisma } from '@/lib/prisma';
import { BadRequestError, UnAuthorizedError } from '@/lib/errors';
import { AuthProvider, Role, User } from '@prisma/client';
import { userMapper } from './user.mapper';
import { v4 as uuidv4 } from 'uuid';
import { sendPasswordResetEmail } from '@/services/resend/password';
import {
  sendPatientAccountCreationEmail,
  sendStaffAccountCreationEmail,
} from '@/services/resend/accounts';
import z from 'zod';

class AuthService {
  private static async authenticateUser(
    userData: UserDto,
    rememberMe?: boolean,
  ) {
    const token = tokenService.generateAccessToken(userData);
    const refreshToken = tokenService.generateRefreshToken(
      userData.id,
      rememberMe,
    );

    await prisma.user.update({
      where: { id: userData.id },
      data: { refreshToken },
    });

    return { token, refreshToken };
  }

  static async credentialsSignIn(payload: LoginUserDto) {
    const { email, password, rememberMe } = loginUserSchema.parse(payload);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { authMethods: true },
    });
    if (!user) {
      throw new BadRequestError('Invalid email or password');
    }

    if (user.status !== 'active') {
      throw new BadRequestError(
        'Account is blocked. Please contact an administrator',
      );
    }

    const localAuthMethod = user.authMethods.find(
      (method) => method.provider === AuthProvider.LOCAL,
    );

    if (!localAuthMethod || !localAuthMethod.passwordHash) {
      throw new BadRequestError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      localAuthMethod.passwordHash,
    );

    if (!isPasswordValid) {
      throw new BadRequestError('Invalid email or password');
    }

    const { token, refreshToken } = await AuthService.authenticateUser(
      userMapper(user),
      rememberMe,
    );
    return { token, refreshToken, user: userMapper(user), rememberMe };
  }

  static async createNewUser(
    email: string,
    name: string,
    role: Role,
  ): Promise<User> {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new BadRequestError('User with this email already exists');
    }

    const newUser = await prisma.user.create({ data: { email, role } });

    // Generate default password alpha-numeric string of length 8
    const defaultPassword = crypto.randomUUID().slice(0, 8);
    const passwordHash = await bcrypt.hash(defaultPassword, 10);

    try {
      if (role === 'patient') {
        await sendPatientAccountCreationEmail({
          email: newUser.email,
          name,
          role: newUser.role,
          password: defaultPassword,
        });
      } else {
        await sendStaffAccountCreationEmail({
          email: newUser.email,
          name,
          role: newUser.role,
          password: defaultPassword,
        });
      }
    } catch (e) {
      await prisma.user.delete({ where: { id: newUser.id } });
      throw e;
    }

    await prisma.authMethod.create({
      data: {
        provider: AuthProvider.LOCAL,
        passwordHash,

        user: { connect: { id: newUser.id } },
      },
    });

    return newUser;
  }

  static async refreshToken(oldRefreshToken: string) {
    const payload = tokenService.verifyRefreshToken(oldRefreshToken);
    if (!payload) {
      throw new UnAuthorizedError(
        'Invalid or expired session, please log in again',
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: payload.userId },
    });
    if (!existingUser || existingUser.refreshToken !== oldRefreshToken) {
      throw new UnAuthorizedError(
        'Invalid or expired session, please log in again',
      );
    }

    if (existingUser.status !== 'active') {
      throw new BadRequestError(
        'Account is blocked. Please contact an administrator',
      );
    }

    const { refreshToken: _, ...userData } = existingUser;
    const { token, refreshToken } = await AuthService.authenticateUser(
      userData,
      payload.rememberMe,
    );

    return { token, refreshToken };
  }

  static async signOut(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  static async forgotPassword(payload: ForgotPasswordDto) {
    const { email } = forgotPasswordSchema.parse(payload);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return;
    }

    const resetToken = uuidv4();
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
      },
    });

    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token: resetToken,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
      },
    });

    await sendPasswordResetEmail(email, resetToken);
    return;
  }

  static async resetPassword(payload: ResetPasswordDto) {
    const { token, newPassword } = resetPasswordSchema.parse(payload);

    const resetTokenRecord = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: { include: { authMethods: true } } },
    });

    if (!resetTokenRecord || resetTokenRecord.expiresAt < new Date()) {
      throw new BadRequestError('Invalid or expired password reset token');
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    const localAuthMethod = resetTokenRecord.user.authMethods.find(
      (method) => method.provider === AuthProvider.LOCAL,
    );

    if (!localAuthMethod) {
      await prisma.authMethod.create({
        data: {
          provider: AuthProvider.LOCAL,
          passwordHash: newPasswordHash,
          user: { connect: { id: resetTokenRecord.userId } },
        },
      });
    } else {
      await prisma.authMethod.update({
        where: { id: localAuthMethod.id },
        data: { passwordHash: newPasswordHash },
      });
    }

    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: resetTokenRecord.userId,
      },
    });

    return;
  }

  static async updateUserEmail(userId: string, newEmail: string) {
    const existingUser = await prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existingUser) {
      throw new BadRequestError('User with this email already exists');
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { email: newEmail },
    });

    return updatedUser;
  }

  static async blockUser(email: string) {
    z.email('Invalid email format').parse(email);
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestError('User not found');
    }

    await prisma.user.update({
      where: { email },
      data: { status: 'blocked' },
    });
  }

  static async activateUser(email: string) {
    z.email('Invalid email format').parse(email);
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new BadRequestError('User not found');
    }

    await prisma.user.update({
      where: { email },
      data: { status: 'active' },
    });
  }
}

export default AuthService;
