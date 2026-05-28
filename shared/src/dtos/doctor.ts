import { PagedResponse } from "./response";

export interface DoctorDto {
  id: string;
  firstName: string;
  lastName: string;
  departmentName: string;
  departmentDescription: string | null;
  departmentId: string;
  email: string;
  userId: string;
}

export type DoctorsResponse = PagedResponse<DoctorDto>;