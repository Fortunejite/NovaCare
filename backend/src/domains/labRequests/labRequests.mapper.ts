import { LabRequestDto, LabTechnicianLabRequestDto } from '@app/shared';
import { LabRequest, Prisma } from '@prisma/client';

export const LabTechnicianLabRequestInclude = {
  patient: {
    select: { lastName: true, firstName: true, phoneNumber: true },
    include: { user: { select: { email: true } } },
  },
  doctor: { select: { lastName: true, firstName: true } },
  labResult: { select: { resultData: true } },
};

type LabRequestWithDetails = Prisma.LabRequestGetPayload<{
  include: typeof LabTechnicianLabRequestInclude;
}>;

export const labRequestMapper = (labRequest: LabRequest): LabRequestDto => ({
  id: labRequest.id,
  patientId: labRequest.patientId,
  doctorId: labRequest.doctorId,
  testType: labRequest.testType,
  status: labRequest.status,
  createdAt: labRequest.createdAt,
});

export const labTechnicianLabRequestMapper = (
  labRequest: LabRequestWithDetails,
): LabTechnicianLabRequestDto => ({
  id: labRequest.id,
  patientId: labRequest.patientId,
  doctorId: labRequest.doctorId,
  testType: labRequest.testType,
  status: labRequest.status,
  createdAt: labRequest.createdAt,
  patientName: `${labRequest.patient.firstName} ${labRequest.patient.lastName}`,
  patientEmail: labRequest.patient.user?.email ?? null,
  patientPhone: labRequest.patient.phoneNumber,
  doctorName: `${labRequest.doctor.firstName} ${labRequest.doctor.lastName}`,
  result: labRequest.labResult?.resultData || null,
});
