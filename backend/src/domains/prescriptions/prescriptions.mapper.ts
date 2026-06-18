import { PrescriptionDto } from "@app/shared";
import { Prescription } from "@prisma/client";

export const prescriptionMapper = (prescription: Prescription): PrescriptionDto => {
  return {
    id: prescription.id,
    consultationId: prescription.consultationId,
    medicationId: prescription.medicationId,
    dosage: prescription.dosage,
    frequency: prescription.frequency,
    duration: prescription.duration,
    pharmacistId: prescription.pharmacistId,
    status: prescription.status,
    createdAt: prescription.createdAt,
    updatedAt: prescription.updatedAt,
  };
};