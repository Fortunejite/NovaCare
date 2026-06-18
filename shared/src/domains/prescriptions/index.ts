import { PagedResponse, PrescriptionStatus } from '../../shared';

export * from './prescriptions.validation';

export interface PrescriptionDto {
  id: string;
  consultationId: string;
  medicationId: string;
  dosage: string;
  frequency: string;
  duration: string;
  pharmacistId: string | null;
  status: PrescriptionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export type PrescriptionsResponse = PagedResponse<PrescriptionDto>;