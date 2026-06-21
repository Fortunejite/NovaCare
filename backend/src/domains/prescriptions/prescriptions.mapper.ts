import {
  PrescribedItemDto,
  PrescriptionDto,
  PrescriptionPharmacistDetails,
  PrescriptionPharmacistListItem,
} from '@app/shared';
import { Prescription, Prisma } from '@prisma/client';

export const PharmacistListItemInclude = {
  consultation: {
    select: { id: true },
    include: {
      appointment: {
        select: { datetime: true },
        include: {
          patient: { select: { firstName: true, lastName: true } },
          doctor: { select: { firstName: true, lastName: true } },
        },
      },
    },
  },
};

export const PharmacistDetailsInclude = {
  ...PharmacistListItemInclude,
  prescribedItems: { include: { medication: { select: { name: true } } } },
};

export const PrescribedItemsInclude = {
  medication: { select: { name: true } },
};

type PharmacistListItem = Prisma.PrescriptionGetPayload<{
  include: typeof PharmacistListItemInclude;
}>;

type PharmacistDetails = Prisma.PrescriptionGetPayload<{
  include: typeof PharmacistDetailsInclude;
}>;

type PrescribedItems = Prisma.PrescribedItemGetPayload<{
  include: typeof PrescribedItemsInclude;
}>;

class PrescriptionsMapper {
  static toPharmacistListItemDto(
    p: PharmacistListItem,
  ): PrescriptionPharmacistListItem {
    return {
      id: p.id,
      consultationId: p.consultationId,
      pharmacistId: p.pharmacistId,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      patientName: `${p.consultation.appointment.patient.firstName} ${p.consultation.appointment.patient.lastName}`,
      doctorName: `${p.consultation.appointment.doctor.firstName} ${p.consultation.appointment.doctor.lastName}`,
      consultationDate: p.consultation.createdAt,
    };
  }

  static toPrescribedItemDto(p: PrescribedItems): PrescribedItemDto {
    return {
      id: p.id,
      prescriptionId: p.prescriptionId,
      medicationId: p.medicationId,
      medicationName: p.medication.name,
      dosage: p.dosage,
      frequency: p.frequency,
      duration: p.duration,
    };
  }

  static toPharmacistDetailsDto(
    p: PharmacistDetails,
  ): PrescriptionPharmacistDetails {
    return {
      id: p.id,
      consultationId: p.consultationId,
      pharmacistId: p.pharmacistId,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      patientName: `${p.consultation.appointment.patient.firstName} ${p.consultation.appointment.patient.lastName}`,
      doctorName: `${p.consultation.appointment.doctor.firstName} ${p.consultation.appointment.doctor.lastName}`,
      consultationDate: p.consultation.createdAt,
      prescribedItems: p.prescribedItems.map((item) =>
        this.toPrescribedItemDto(item),
      ),
    };
  }
}

export default PrescriptionsMapper;
