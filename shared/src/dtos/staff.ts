import { Role } from '../constants';
import { PagedResponse } from './response';

export interface StaffDto {
  id: string;
  email: string;
  role: Role;
  profileId: string | null;
  firstName: string | null;
  lastName: string | null;
}

export type StaffResponse = PagedResponse<StaffDto>;

export type StaffSummaryResponse = Record<Role, number>;