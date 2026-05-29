import { prisma } from '@/lib/prisma';
import AuthController from './auth.controller';
import { NotFoundError } from '@/lib/errors';
import { pageResponseMapper } from '@/mapper/pagedResponse';
import {
  CreatePharmacistDto,
  createPharmacistSchema,
  PharmacistDto,
  PharmacistsResponse,
  UpdatePharmacistDto,
  updatePharmacistSchema,
} from '@app/shared';
import { pharmacistMapper } from '@/mapper/pharmacist';

class PharmacistController {
  private static include = { user: true };

  static async createPharmacist(
    payload: CreatePharmacistDto,
  ): Promise<PharmacistDto> {
    const { email, ...data } = createPharmacistSchema.parse(payload);

    const newUser = await AuthController.createNewUser(
      email,
      `${data.firstName} ${data.lastName}`,
      'pharmacist',
    );

    const pharmacistProfile = await prisma.pharmacist.create({
      data: { ...data, userId: newUser.id },
      include: this.include,
    });

    return pharmacistMapper(pharmacistProfile);
  }

  static async getAllPharmacists(
    page = 1,
    limit = 10,
  ): Promise<PharmacistsResponse> {
    const [pharmacists, total] = await Promise.all([
      prisma.pharmacist.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: this.include,
      }),
      prisma.pharmacist.count(),
    ]);

    const data = pageResponseMapper({
      data: pharmacists.map(pharmacistMapper),
      page,
      limit,
      total,
    });

    return data;
  }

  static async getPharmacistById(id: string): Promise<PharmacistDto> {
    const pharmacist = await prisma.pharmacist.findUnique({
      where: { id },
      include: this.include,
    });

    if (!pharmacist) {
      throw new NotFoundError('Pharmacist not found');
    }

    return pharmacistMapper(pharmacist);
  }

  static async updatePharmacist(
    id: string,
    payload: UpdatePharmacistDto,
  ): Promise<PharmacistDto> {
    const { email, ...data } = updatePharmacistSchema.parse(payload);
    const pharmacist = await prisma.pharmacist.findUnique({
      where: { id },
    });

    if (!pharmacist) {
      throw new NotFoundError('Pharmacist not found');
    }

    if (email) {
      await AuthController.updateUserEmail(pharmacist.userId, email);
    }

    const updatedPharmacist = await prisma.pharmacist.update({
      where: { id },
      data: data,
      include: this.include,
    });

    return pharmacistMapper(updatedPharmacist);
  }
}

export default PharmacistController;
