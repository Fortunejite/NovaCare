import { BadRequestError, NotFoundError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import {
  UpdatePrescriptionSchemaDto,
  updatePrescriptionSchema,
  pageResponseMapper,
  PrescriptionsListResponse,
  PrescriptionPharmacistDetails,
  PrescribedItemDto,
  DispensePrescriptionSchemaDto,
  dispensePrescriptionSchema,
  CreatePrescriptionSchemaDto,
  createPrescriptionSchema,
} from '@app/shared';
import PrescriptionsMapper, {
  PharmacistDetailsInclude,
  PharmacistListItemInclude,
  PrescribedItemsInclude,
} from './prescriptions.mapper';
import { Prisma } from '@prisma/client';

class PrescriptionsService {
  static async addPrescriptionItem(
    prescriptionId: string,
    payload: CreatePrescriptionSchemaDto,
  ): Promise<PrescribedItemDto> {
    const data = createPrescriptionSchema.parse(payload);

    const prescriptionExists = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      select: { status: true },
    });
    if (!prescriptionExists) {
      throw new NotFoundError('Prescription not found');
    }

    if (prescriptionExists.status !== 'pending') {
      throw new BadRequestError('Only pending prescriptions can be updated');
    }

    const newPrescriptionItem = await prisma.prescribedItem.create({
      data: { prescriptionId, ...data },
      include: PrescribedItemsInclude,
    });

    return PrescriptionsMapper.toPrescribedItemDto(newPrescriptionItem);
  }

  static async updatePrescriptionItem(
    prescriptionId: string,
    itemId: string,
    payload: UpdatePrescriptionSchemaDto,
  ): Promise<PrescribedItemDto> {
    const data = updatePrescriptionSchema.parse(payload);

    const prescriptionExists = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      select: { status: true },
    });
    if (!prescriptionExists) {
      throw new NotFoundError('Prescription not found');
    }

    if (prescriptionExists.status !== 'pending') {
      throw new BadRequestError('Only pending prescriptions can be updated');
    }

    const updatedPrescription = await prisma.prescribedItem.update({
      where: { id: itemId },
      include: PrescribedItemsInclude,
      data,
    });

    return PrescriptionsMapper.toPrescribedItemDto(updatedPrescription);
  }

  static async deletePrescriptionItem(
    prescriptionId: string,
    itemId: string,
  ): Promise<void> {
    const prescriptionExists = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      select: { status: true },
    });
    if (!prescriptionExists) {
      throw new NotFoundError('Prescription not found');
    }

    if (prescriptionExists.status !== 'pending') {
      throw new BadRequestError('Only pending prescriptions can be updated');
    }

    await prisma.prescribedItem.delete({
      where: { id: itemId },
    });
    return;
  }

  static async getAllPrescriptions(payload: {
    status?: string;
    userId: string;
    page: number;
    limit: number;
  }): Promise<PrescriptionsListResponse> {
    const { status, page, userId, limit } = payload;
    const skip = (page - 1) * limit;

    let where: Prisma.PrescriptionWhereInput = {};

    if (status === 'pending') {
      where = { status: 'pending' };
    } else {
      const pharmacist = await prisma.pharmacist.findFirst({
        where: { userId },
      });

      if (!pharmacist) {
        throw new NotFoundError('Pharmacist not found');
      }

      const pharmacistId = pharmacist.id;
      where = { pharmacistId };
    }

    const [prescriptions, total] = await Promise.all([
      prisma.prescription.findMany({
        where,
        include: PharmacistListItemInclude,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.prescription.count({
        where,
      }),
    ]);

    return pageResponseMapper({
      data: prescriptions.map(PrescriptionsMapper.toPharmacistListItemDto),
      total,
      page,
      limit,
    });
  }

  static async getPrescriptionById(
    prescriptionId: string,
  ): Promise<PrescriptionPharmacistDetails> {
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: PharmacistDetailsInclude,
    });

    if (!prescription) {
      throw new NotFoundError('Prescription not found');
    }

    return PrescriptionsMapper.toPharmacistDetailsDto(prescription);
  }

  static async dispensePrescription(
    payload: DispensePrescriptionSchemaDto,
    prescriptionId: string,
    userId: string,
  ): Promise<void> {
    const { dispensedItems } = dispensePrescriptionSchema.parse(payload);
    const prescriptionExists = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
    });
    if (!prescriptionExists) {
      throw new NotFoundError('Prescription not found');
    }

    if (prescriptionExists.status === 'dispensed') {
      throw new BadRequestError('Prescription has already been dispensed');
    }

    if (prescriptionExists.status !== 'pending') {
      throw new BadRequestError('Only pending prescriptions can be dispensed');
    }

    const pharmacist = await prisma.pharmacist.findFirst({
      where: { userId },
    });

    if (!pharmacist) {
      throw new NotFoundError('Pharmacist not found');
    }

    // Atomically update prescription status and decrement medication stock
    await prisma.$transaction(async (tx) => {
      const pres = await tx.prescription.findUnique({
        where: { id: prescriptionId },
        include: { prescribedItems: { include: { medication: true } } },
      });
      if (!pres) throw new NotFoundError('Prescription not found');

      await Promise.all(
        pres.prescribedItems.map((item) => {
          const dispensedQuantity =
            dispensedItems.find((di) => di.itemId === item.id)?.quantity || 1;
          const medication = item.medication;
          if (medication.stockQuantity < dispensedQuantity) {
            throw new BadRequestError(
              `Insufficient stock for medication ${medication.name}`,
            );
          }
          return tx.medication.update({
            where: { id: medication.id },
            data: {
              stockQuantity: medication.stockQuantity - dispensedQuantity,
            },
          });
        }),
      );

      await tx.prescription.update({
        where: { id: prescriptionId },
        data: { pharmacistId: pharmacist.id, status: 'dispensed' },
      });
    });
  }

  static async cancelPrescription(prescriptionId: string): Promise<void> {
    const prescriptionExists = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
    });
    if (!prescriptionExists) {
      throw new NotFoundError('Prescription not found');
    }

    if (prescriptionExists.status !== 'pending') {
      throw new BadRequestError('Only pending prescriptions can be cancelled');
    }

    await prisma.prescription.update({
      where: { id: prescriptionId },
      data: { status: 'cancelled' },
    });
  }
}

export default PrescriptionsService;
