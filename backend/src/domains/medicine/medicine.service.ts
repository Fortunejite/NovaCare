import { prisma } from '@/lib/prisma';
import {
  createMedicineSchema,
  CreateMedicineSchemaDto,
  MedicineDto,
  MedicineResponseDto,
} from '@app/shared';
import { medicineMapper } from './medicine.mapper';
import { pageResponseMapper } from '@app/shared';
import { Prisma } from '@prisma/client';
import { NotFoundError } from '@/lib/errors';

class MedicineService {
  static async createMedicine(
    payload: CreateMedicineSchemaDto,
  ): Promise<MedicineDto> {
    const data = createMedicineSchema.parse(payload);

    const medicine = await prisma.medication.create({ data });
    return medicineMapper(medicine);
  }

  static async getMedicines({
    name = '',
    page = 1,
    limit = 10,
  }): Promise<MedicineResponseDto> {
    const where: Prisma.MedicationWhereInput =
      name.length > 0
        ? {
            name: {
              contains: name,
              mode: 'insensitive',
            },
            deletedAt: null,
          }
        : { deletedAt: null };
    const skip = (page - 1) * limit;

    const [medicines, total] = await Promise.all([
      prisma.medication.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.medication.count({ where }),
    ]);

    return pageResponseMapper({
      data: medicines.map(medicineMapper),
      total,
      limit,
      page,
    });
  }

  static async getMedicineById(id: string): Promise<MedicineDto> {
    const medicine = await prisma.medication.findUnique({ where: { id } });
    if (!medicine || medicine.deletedAt) {
      throw new NotFoundError('Medicine not found');
    }
    return medicineMapper(medicine);
  }

  static async updateMedicine(
    id: string,
    payload: CreateMedicineSchemaDto,
  ): Promise<MedicineDto> {
    const data = createMedicineSchema.parse(payload);

    const medicineExists = await prisma.medication.findUnique({
      where: { id },
    });
    if (!medicineExists || medicineExists.deletedAt) {
      throw new NotFoundError('Medicine not found');
    }

    const medicine = await prisma.medication.update({
      where: { id },
      data,
    });

    return medicineMapper(medicine);
  }

  static async deleteMedicine(id: string): Promise<void> {
    const medicineExists = await prisma.medication.findUnique({
      where: { id },
    });
    if (!medicineExists || medicineExists.deletedAt) {
      throw new NotFoundError('Medicine not found');
    }

    await prisma.medication.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return;
  }
}

export default MedicineService;
