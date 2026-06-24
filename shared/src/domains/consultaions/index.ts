import { PrescriptionDto } from '../prescriptions';
import { LabRequestStatus, LabTestType, PagedResponse } from '../../shared';

export * from './consultaions.validation';

export interface ConsultationLabRequestDto {
  id: string;
  consultationId: string;
  testType: LabTestType;
  status: LabRequestStatus;
  labTechnicianId: string | null;
  labTechnicianName: string | null;
  result: string | null;
  createdAt: Date;
}

export interface ConsultationDto {
  id: string;
  completedAt: Date;
  appointmentId: string;
  diagnosis: string | null;
  notes: string | null;
  patientName: string;
  patientPhoneNumber: string;
  appointmentDate: Date;
  prescriptions: PrescriptionDto[];
  labRequests: ConsultationLabRequestDto[];
}

export type ConsultationsResponse = PagedResponse<ConsultationDto>;
