import { PagedResponse } from "../../shared";

export * from './pharmacist.validation';

export interface PharmacistDto {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender: string;
  phoneNumber: string;
  qualification: string;
  licenseNumber: string;
  address: string;
  userId: string;
  createdAt: Date;
}

export type PharmacistsResponse = PagedResponse<PharmacistDto>;