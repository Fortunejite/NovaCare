import { PagedResponse } from '../../shared';

export * from './receptionist.validation'

export interface ReceptionistDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  phoneNumber: string;
  address: string;
  userId: string;
  dateOfBirth: Date;
  createdAt: Date;
}

export type ReceptionistsResponse = PagedResponse<ReceptionistDto>;