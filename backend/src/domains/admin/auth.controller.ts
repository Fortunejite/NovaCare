import { BadRequestError } from '@/lib/errors';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/prisma';
import { AuthProvider, Role, User } from '@prisma/client';
import { z } from 'zod';
import { sendStaffAccountCreationEmail } from '@/services/resend/accounts';

class AuthController {
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
      await sendStaffAccountCreationEmail({
        email: newUser.email,
        name,
        role: newUser.role,
        password: defaultPassword,
      });
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

  static async unblockUser(email: string) {
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

export default AuthController;
