import { BadRequestError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { UpdatePrescriptionSchemaDto, PrescriptionDto, updatePrescriptionSchema, PrescriptionsResponse, pageResponseMapper } from "@app/shared";
import { prescriptionMapper } from "./prescriptions.mapper";

class PrescriptionsService {
  static async updatePrescription(
    prescriptionId: string,
    payload: UpdatePrescriptionSchemaDto,
  ): Promise<PrescriptionDto> {
    const data = updatePrescriptionSchema.parse(payload);

    const prescriptionExists = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
    });
    if (!prescriptionExists) {
      throw new NotFoundError('Prescription not found');
    }

    const updatedPrescription = await prisma.prescription.update({
      where: { id: prescriptionId },
      data,
    });

    return prescriptionMapper(updatedPrescription);
  }

  static async getAllPrescriptions(userId: string, page: number, limit: number): Promise<PrescriptionsResponse> {
    const skip = (page - 1) * limit;

    const pharmacist = await prisma.pharmacist.findFirst({
      where: { userId },
    });

    if (!pharmacist) {
      throw new NotFoundError('Pharmacist not found');
    }

    const pharmacistId = pharmacist.id;
    const prescriptions = await prisma.prescription.findMany({
      where: { OR: [{ pharmacistId }, { status: 'pending' }] },
      skip,
      take: limit,
    });

    const total = await prisma.prescription.count({
      where: { OR: [{ pharmacistId }, { status: 'pending' }] },
    });

    return pageResponseMapper({
      data: prescriptions.map(prescriptionMapper),
      total,
      page,
      limit,
    })
  }

  static async getPrescriptionById(prescriptionId: string): Promise<PrescriptionDto> {
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
    });
    if (!prescription) {
      throw new NotFoundError('Prescription not found');
    }

    return prescriptionMapper(prescription);
  }

  static async dispensePrescription(prescriptionId: string, userId: string): Promise<void> {
    const prescriptionExists = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
    });
    if (!prescriptionExists) {
      throw new NotFoundError('Prescription not found');
    }

    if (prescriptionExists.status === 'dispensed') {
      throw new BadRequestError('Prescription has already been dispensed');
    }

    const pharmacist = await prisma.pharmacist.findFirst({
      where: { userId },
    });

    if (!pharmacist) {
      throw new NotFoundError('Pharmacist not found');
    }

    await prisma.prescription.update({
      where: { id: prescriptionId },
      data: { pharmacistId: pharmacist.id, status: 'dispensed' },
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