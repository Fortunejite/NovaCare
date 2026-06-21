import { LabRequestDto, LabTechnicianLabRequestDto } from '@app/shared';
import { LabRequest, Prisma } from '@prisma/client';

export const LabTechnicianLabRequestInclude = {
  consultation: {
    include: {
      appointment: {
        include: {
          patient: {
            select: { firstName: true, lastName: true, phoneNumber: true },
          },
          doctor: { select: { firstName: true, lastName: true } },
        },
      },
    },
  },
  labResult: { select: { resultData: true } },
};

type LabRequestWithDetails = Prisma.LabRequestGetPayload<{
  include: typeof LabTechnicianLabRequestInclude;
}>;

class LabTestMapper {
  static toLabRequestDto(l: LabRequest): LabRequestDto {
    return {
      id: l.id,
      consultationId: l.consultationId,
      labTechnicianId: l.labTechnicianId,
      status: l.status,
      createdAt: l.createdAt,
      testType: l.testType,
    };
  }

  static toLabRequestDetailsDto(
    l: LabRequestWithDetails,
  ): LabTechnicianLabRequestDto {
    const patientData = l.consultation.appointment.patient;
    const doctorData = l.consultation.appointment.doctor;
    return {
      id: l.id,
      consultationId: l.consultationId,
      labTechnicianId: l.labTechnicianId,
      status: l.status,
      createdAt: l.createdAt,
      patientPhone: patientData.phoneNumber,
      patientName: `${patientData.firstName} ${patientData.lastName}`,
      doctorName: `${doctorData.firstName} ${doctorData.lastName}`,
      consultationDate: l.consultation.createdAt,
      result: l.labResult?.resultData || null,
      testType: l.testType,
    };
  }
}

export default LabTestMapper;