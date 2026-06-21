import { BadRequestError, NotFoundError } from "@/lib/errors";
import { prisma } from "@/lib/prisma";
import { UpdatePrescriptionSchemaDto, PrescriptionDto, updatePrescriptionSchema, PrescriptionsResponse, pageResponseMapper, PharmacistPrescriptionDto } from "@app/shared";
import { prescriptionMapper } from "./prescriptions.mapper";

class PrescriptionsService {
  static async updatePrescription(
    prescriptionId: string,
    itemId: string,
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
      include: {
        medication: true,
        consultation: {
          include: {
            appointment: {
              include: {
                patient: true,
              },
            },
          },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    const total = await prisma.prescription.count({
      where: { OR: [{ pharmacistId }, { status: 'pending' }] },
    });

    const data = prescriptions.map((p: any): PharmacistPrescriptionDto => ({
      id: p.id,
      consultationId: p.consultationId,
      medicationId: p.medicationId,
      dosage: p.dosage,
      frequency: p.frequency,
      duration: p.duration,
      pharmacistId: p.pharmacistId,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      medicationName: p.medication.name,
      patientName: `${p.consultation.appointment.patient.firstName} ${p.consultation.appointment.patient.lastName}`,
      consultationDate: p.consultation.createdAt,
    }));

    return pageResponseMapper({
      data,
      total,
      page,
      limit,
    })
  }

  static async getPrescriptionById(prescriptionId: string): Promise<PharmacistPrescriptionDto> {
    const prescription = await prisma.prescription.findUnique({
      where: { id: prescriptionId },
      include: {
        medication: true,
        consultation: {
          include: {
            appointment: {
              include: {
                patient: true,
              },
            },
          },
        },
      },
    });
    if (!prescription) {
      throw new NotFoundError('Prescription not found');
    }

    const p: any = prescription;
    return {
      id: p.id,
      consultationId: p.consultationId,
      medicationId: p.medicationId,
      dosage: p.dosage,
      frequency: p.frequency,
      duration: p.duration,
      pharmacistId: p.pharmacistId,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      medicationName: p.medication.name,
      patientName: `${p.consultation.appointment.patient.firstName} ${p.consultation.appointment.patient.lastName}`,
      consultationDate: p.consultation.createdAt,
    };
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
      const pres = await tx.prescription.findUnique({ where: { id: prescriptionId } });
      if (!pres) throw new NotFoundError('Prescription not found');

      const medication = await tx.medication.findUnique({ where: { id: pres.medicationId } });
      if (!medication) throw new NotFoundError('Medication not found');

      if (medication.stockQuantity <= 0) {
        throw new BadRequestError('Insufficient medication stock to dispense prescription');
      }

      await tx.medication.update({
        where: { id: medication.id },
        data: { stockQuantity: medication.stockQuantity - 1 },
      });

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