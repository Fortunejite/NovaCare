import { Role, UserStatus } from '../constants';
import { PagedResponse } from './response';

export interface StaffDto {
  id: string;
  email: string;
  role: Role;
  status: UserStatus;
  profileId: string | null;
  firstName: string | null;
  lastName: string | null;
}

export type StaffResponse = PagedResponse<StaffDto>;

export interface StaffSummaryResponse {
  doctors: number;
  pharmacists: number;
  receptionists: number;
  labTechnicians: number;
}
