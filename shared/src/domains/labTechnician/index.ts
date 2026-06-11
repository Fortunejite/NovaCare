import { PagedResponse } from '../../shared';

export * from './labTechnician.validation';

export interface LabTechnicianDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  phoneNumber: string;
  qualification: string;
  address: string;
  userId: string;
  createdAt: Date;
}

export type LabTechniciansResponse = PagedResponse<LabTechnicianDto>;
