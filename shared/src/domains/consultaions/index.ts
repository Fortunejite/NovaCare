import { PrescriptionDto } from '../prescriptions';

export * from './consultaions.validation';

export interface ConsultationDto {
  id: string;
  completedAt: Date;
  appointmentId: string;
  diagnosis: string | null;
  notes: string | null;
  patientName: string;
  patientPhoneNumber: string;
  prescriptions: PrescriptionDto[];
}
