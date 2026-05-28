import { PagedResponse } from "./response";

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