import { PatientStatus } from "../constants";
import { PagedResponse } from "./response";

export interface PatientDto {
  id: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: Date;
  bloodGroup: string;
  genotype: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  maritalStatus: string;
  weight: number;
  height: number;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  allergies: string | null;
  medicalHistory: string | null;
  status: PatientStatus;
  email: string;
  userId: string;
}

export type PatientsResponse = PagedResponse<PatientDto>;