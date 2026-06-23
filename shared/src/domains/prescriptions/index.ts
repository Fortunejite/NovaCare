import { PagedResponse, PrescriptionStatus } from '../../shared';

export * from './prescriptions.validation';

export interface PrescribedItemDto {
  id: string;
  prescriptionId: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  quantity: number | null;
}

export interface PrescriptionPharmacistListItem {
  id: string;
  consultationId: string;
  pharmacistId: string | null;
  status: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  patientName: string;
  doctorName: string;
  consultationDate: string | Date;
  prescribedItemsCount: number;
}

export type PrescriptionsListResponse = PagedResponse<PrescriptionPharmacistListItem>;

export interface PrescriptionPharmacistDetails extends Omit<PrescriptionPharmacistListItem, 'prescribedItemsCount'> {
  prescribedItems: PrescribedItemDto[]
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
  prescribedItems: string;
}

export interface PharmacistPrescriptionDto extends PrescriptionDto {
  prescribedItems: PharmacistPrescribedItemsDto[];
  patientName: string;
  consultationDate: Date;
}

