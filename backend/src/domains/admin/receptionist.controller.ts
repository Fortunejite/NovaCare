import { prisma } from '@/lib/prisma';
import { receptionistMapper } from '@/mapper/receptionist';
import {
  CreateReceptionistDto,
  UpdateReceptionistDto,
  ReceptionistDto,
  ReceptionistsResponse,
  createReceptionistSchema,
  updateReceptionistSchema,
} from '@app/shared';
import AuthController from './auth.controller';
import { NotFoundError } from '@/lib/errors';
import { pageResponseMapper } from '@/mapper/pagedResponse';

class ReceptionistController {
  private static include = { user: true };

  static async createReceptionist(
    payload: CreateReceptionistDto,
  ): Promise<ReceptionistDto> {
    const { email, ...data } = createReceptionistSchema.parse(payload);

    const newUser = await AuthController.createNewUser(
      email,
      `${data.firstName} ${data.lastName}`,
      'receptionist',
    );

    const receptionistProfile = await prisma.receptionist.create({
      data: { ...data, userId: newUser.id },
      include: this.include,
    });

    return receptionistMapper(receptionistProfile);
  }

  static async getAllReceptionists(
    page = 1,
    limit = 10,
  ): Promise<ReceptionistsResponse> {
    const [receptionists, total] = await Promise.all([
      prisma.receptionist.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: this.include,
      }),
      prisma.receptionist.count(),
    ]);

    const data = pageResponseMapper({
      data: receptionists.map(receptionistMapper),
      page,
      limit,
      total,
    });

    return data;
  }

  static async getReceptionistById(id: string): Promise<ReceptionistDto> {
    const receptionist = await prisma.receptionist.findUnique({
      where: { id },
      include: this.include,
    });

    if (!receptionist) {
      throw new NotFoundError('Receptionist not found');
    }

    return receptionistMapper(receptionist);
  }

  static async updateReceptionist(
    id: string,
    payload: UpdateReceptionistDto,
  ): Promise<ReceptionistDto> {
    const { email, ...data } = updateReceptionistSchema.parse(payload);
    const receptionist = await prisma.receptionist.findUnique({
      where: { id },
      include: { user: { select: { email: true } } },
    });

    if (!receptionist) {
      throw new NotFoundError('Receptionist not found');
    }

    if (email && email !== receptionist.user.email) {
      await AuthController.updateUserEmail(receptionist.userId, email);
    }

    const updatedReceptionist = await prisma.receptionist.update({
      where: { id },
      data: data,
      include: this.include,
    });

    return receptionistMapper(updatedReceptionist);
  }
}

export default ReceptionistController;
