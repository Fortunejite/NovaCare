import { ReceptionistAppointmentDto } from '@app/shared';
import { Prisma } from '@prisma/client';

export const ReceptionistAppointmentInclude = {
  doctor: {
    select: { lastName: true, firstName: true }
  },
  patient: {
    select: { lastName: true, firstName: true }
  }
};
type ReceptionistAppointment = Prisma.AppointmentGetPayload<{
  include: typeof ReceptionistAppointmentInclude;
}>;

export const receptionistAppointmentMapper = (
  appointment: ReceptionistAppointment,
): ReceptionistAppointmentDto => ({
  id: appointment.id,
  patientId: appointment.patientId,
  patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
  doctorId: appointment.doctorId,
  doctorName: `${appointment.doctor.firstName} ${appointment.doctor.lastName}`,
  receptionistId: appointment.receptionistId,
  datetime: appointment.datetime,
  reason: appointment.reason,
  status: appointment.status,
  createdAt: appointment.createdAt,
});
