import { ConsultationDto } from '@app/shared';
import { Prisma } from '@prisma/client';
import { toPrescribedItemDto } from '../prescriptions';

export const DoctorConsultationInclude = {
  appointment: {
    include: {
      patient: {
        select: { firstName: true, lastName: true, phoneNumber: true },
      },
    },
  },
  prescriptions: { include: { prescribedItems: { include: { medication: { select: { name: true } } } } } },
  labRequests: {
    include: {
      labTechnician: { select: { firstName: true, lastName: true } },
      labResult: { select: { resultData: true } },
    },
  },
};

type DoctorAppointment = Prisma.ConsultationGetPayload<{
  include: typeof DoctorConsultationInclude;
}>;

export const doctorConsultationMapper = (payload: DoctorAppointment): ConsultationDto => {
  const patientInfo = payload.appointment.patient;
  const patientName = `${patientInfo.firstName} ${patientInfo.lastName}`;

  return {
    id: payload.id,
    diagnosis: payload.diagnosis,
    notes: payload.notes,

    completedAt: payload.createdAt,

    appointmentId: payload.appointment.id,
    appointmentDate: payload.appointment.datetime,
    appointmentStatus: payload.appointment.status,
    patientName,
    patientPhoneNumber: patientInfo.phoneNumber,
    prescriptions: payload.prescriptions.map((prescription) => ({
      ...prescription,
      prescribedItems: prescription.prescribedItems.map(toPrescribedItemDto),
    })),
    labRequests: payload.labRequests.map((request) => ({
      id: request.id,
      consultationId: request.consultationId,
      testType: request.testType,
      status: request.status,
      labTechnicianId: request.labTechnicianId,
      labTechnicianName: request.labTechnician
        ? `${request.labTechnician.firstName} ${request.labTechnician.lastName}`
        : null,
      result: request.labResult?.resultData ?? null,
      createdAt: request.createdAt,
    })),
  };
};
