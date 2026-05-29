import { PatientDto } from "@app/shared";
import { Patient, Prisma } from "@prisma/client";

type PatientWithDetails = Prisma.PatientGetPayload<{
  include: {
    user: true,
  }
}>

export const patientMapper = (patient: PatientWithDetails): PatientDto => ({
  id: patient.id,
  firstName: patient.firstName,
  lastName: patient.lastName,
  gender: patient.gender,
  dateOfBirth: patient.dateOfBirth,
  bloodGroup: patient.bloodGroup,
  genotype: patient.genotype,
  phoneNumber: patient.phoneNumber,
  address: patient.address,
  city: patient.city,
  state: patient.state,
  maritalStatus: patient.maritalStatus,
  weight: patient.weight,
  height: patient.height,
  emergencyContactName: patient.emergencyContactName,
  emergencyContactPhone: patient.emergencyContactPhone,
  emergencyContactRelationship: patient.emergencyContactRelationship,
  allergies: patient.allergies,
  medicalHistory: patient.medicalHistory,
  status: patient.status,
  email: patient.user.email,
  userId: patient.userId,
});