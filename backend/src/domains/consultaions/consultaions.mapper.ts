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
    patientName,
    patientPhoneNumber: patientInfo.phoneNumber,
    prescriptions: payload.prescriptions.map((prescription) => ({
      ...prescription,
      prescribedItems: prescription.prescribedItems.map(toPrescribedItemDto),
    })),
  };
};
