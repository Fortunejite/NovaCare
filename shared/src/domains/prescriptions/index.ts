export * from './prescriptions.validation';

export interface PrescriptionDto {
  id: string;
  consultationId: string;
  medicationId: string;
  dosage: string;
  frequency: string;
  duration: string;
  createdAt: Date;
  updatedAt: Date;
}
