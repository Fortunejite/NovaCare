import { PagedResponse, PrescriptionStatus } from '../../shared';

export * from './prescriptions.validation';

export interface PrescribedItemDto {
  id: string;
  prescriptionId: string;
  medicationId: string;
  dosage: string;
  frequency: string;
  duration: string;
}

export interface PrescriptionDto {
  id: string;
  consultationId: string;
  pharmacistId: string | null;
  prescribedItems: PrescribedItemDto[];
  status: PrescriptionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface PharmacistPrescribedItemsDto extends PrescribedItemDto {
  medicationName: string;
}

export interface PharmacistPrescriptionDto extends PrescriptionDto {
  prescribedItems: PharmacistPrescribedItemsDto[];
  patientName: string;
  consultationDate: Date;
}

export type PrescriptionsResponse = PagedResponse<PharmacistPrescriptionDto>;