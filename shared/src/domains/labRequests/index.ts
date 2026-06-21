import { LabRequestStatus, LabTestType, PagedResponse, PrescriptionStatus } from '../../shared';

export * from './labRequests.validation';

export interface LabRequestDto {
  id: string;
  patientId: string;
  doctorId: string;
  testType: LabTestType;
  status: LabRequestStatus;
  createdAt: Date;
}

export interface LabTechnicianLabRequestDto extends LabRequestDto {
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  doctorName: string;
  result: string | null;
}

export type LabTechnicianLabRequestResponse = PagedResponse<LabTechnicianLabRequestDto>;

