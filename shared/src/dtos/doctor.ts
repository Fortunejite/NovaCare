import { PagedResponse } from "./response";

export interface DoctorDto {
  id: string;
  firstName: string;
  lastName: string;
  departmentName: string;
  departmentDescription: string | null;
  departmentId: string;
  phoneNumber: string;
  address: string;
  consultationFee: number;
  yearsOfExperience: number;
  licenseNumber: string;
  email: string;
  userId: string;
}

export type DoctorsResponse = PagedResponse<DoctorDto>;