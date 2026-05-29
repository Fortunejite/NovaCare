import bcrypt from 'bcrypt';
import { AuthProvider } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { BadRequestError, UnAuthorizedError } from '@/lib/errors';
import {
  forgotPasswordSchema,
  loginUserSchema,
  resetPasswordSchema,
  UserDto,
} from '@app/shared';
import { userMapper } from '@/mapper/user';
import { NextFunction, Response, Request } from 'express';
import { tokenController } from './token.controller';
import { v4 as uuidv4 } from 'uuid';
import { sendPasswordResetEmail } from '@/services/resend/password';

class AuthController {
  private static getCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      // For production, try both strategies to maximize compatibility
      return {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const,
        path: '/',
        // Only set domain if explicitly configured, otherwise let browser handle it
        ...(process.env.COOKIE_DOMAIN && { domain: process.env.COOKIE_DOMAIN }),
      };
    } else {
      // Development settings
      return {
        httpOnly: true,
        secure: false,
        sameSite: 'lax' as const,
        path: '/',
      };
    }
  }

  private static async loginUser(
    res: Response,
    userData: UserDto,
    rememberMe?: boolean,
  ) {
    const token = tokenController.generateAccessToken(userData);
    const refreshToken = tokenController.generateRefreshToken(
      userData.id,
      rememberMe,
    );

    await prisma.user.update({
      where: { id: userData.id },
      data: { refreshToken },
    });

    const cookieOptions = AuthController.getCookieOptions();

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    // Primary cookie strategy
    res.cookie('accessToken', token, {
      ...cookieOptions,
      path: '/',
      maxAge: 10 * 60 * 1000, // 10 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      path: '/api/auth/refresh',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000, // 7 or 30 days
    });
  }

  static async localLogin(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, rememberMe } = loginUserSchema.parse(req.body);

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

      await AuthController.loginUser(res, userMapper(user), rememberMe);
      res.status(200).json(userMapper(user));
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.cookies.accessToken;
      if (!token) {
        throw new UnAuthorizedError('Login required');
      }

      const payload = tokenController.verifyAccessToken(token);
      if (!payload) {
        throw new UnAuthorizedError(
          'Invalid or expired session, please log in again',
        );
      }

      res.status(200).json(payload);
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        throw new UnAuthorizedError('Login required');
      }

      const payload = tokenController.verifyRefreshToken(refreshToken);
      if (!payload) {
        throw new UnAuthorizedError(
          'Invalid or expired session, please log in again',
        );
      }

      const existingUser = await prisma.user.findUnique({
        where: { id: payload.userId },
      });
      if (!existingUser || existingUser.refreshToken !== refreshToken) {
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
      await AuthController.loginUser(res, userData, payload.rememberMe);

      res.status(200).json({ message: 'Token refreshed' });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      await prisma.user.update({
        where: { id: userId },
        data: { refreshToken: null },
      });
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user) {
        res.status(200).json({
          message:
            'If an account with that email exists, a password reset link has been sent',
        });
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
      res
        .status(200)
        .json({
          message:
            'If an account with that email exists, a password reset link has been sent',
        });
    } catch (err) {
      next(err);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, newPassword } = resetPasswordSchema.parse(req.body);

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

      res.status(200).json({ message: 'Password reset successful' });
    } catch (err) {
      next(err);
    }
  }
}

export default AuthController;
