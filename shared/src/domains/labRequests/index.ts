import { LabRequestStatus, LabTestType, PagedResponse, PrescriptionStatus } from '../../shared';

export * from './labRequests.validation';

export interface LabRequestDto {
  id: string;
  consultationId: string;
  testType: LabTestType;
  labTechnicianId: string | null;
  status: LabRequestStatus;
  createdAt: Date;
}

export interface LabTechnicianLabRequestDto extends LabRequestDto {
  patientName: string;
  patientPhone: string;
  doctorName: string;
  consultationDate: Date;
  result: string | null;
}

export type LabTechnicianLabRequestResponse = PagedResponse<LabTechnicianLabRequestDto>;

