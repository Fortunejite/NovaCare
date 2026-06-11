import { prisma } from '@/lib/prisma';
import {
  ReceptionistAppointmentDto,
  CreateAppointmentDto,
  createAppointmentSchema,
  pageResponseMapper,
  UpdateAppointmentDto,
  updateAppointmentSchema,
} from '@app/shared';
import {
  receptionistAppointmentMapper,
  ReceptionistAppointmentInclude,
  doctorAppointmentMapper,
  DoctorAppointmentInclude,
} from './appointment.mapper';
import { BadRequestError, NotFoundError } from '@/lib/errors';
import { Role } from '@prisma/client';

class AppointmentService {
  static async createAppointment(
    payload: CreateAppointmentDto,
    userId: string,
  ): Promise<ReceptionistAppointmentDto> {
    const appointment = createAppointmentSchema.parse(payload);
    const receptionist = await prisma.receptionist.findUnique({
      where: { userId },
    });

    const data = { ...appointment, receptionistId: receptionist!.id };

    const newAppointment = await prisma.appointment.create({
      data,
      include: ReceptionistAppointmentInclude,
    });

    return receptionistAppointmentMapper(newAppointment);
  }

  static async fetchReceptionistAppointments(
    page = 1,
    limit = 10,
    patientId: string,
  ) {
    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { patientId },
        include: ReceptionistAppointmentInclude,
      }),
      prisma.appointment.count({
        where: { patientId },
      }),
    ]);

    return pageResponseMapper({
      data: appointments.map(receptionistAppointmentMapper),
      page,
      limit,
      total,
    });
  }

  static async fetchDoctorAppointments(doctorId: string, page = 1, limit = 10) {
    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: { doctorId },
        include: DoctorAppointmentInclude,
      }),
      prisma.appointment.count({
        where: { doctorId },
      }),
    ]);

    return pageResponseMapper({
      data: appointments.map(doctorAppointmentMapper),
      page,
      limit,
      total,
    });
  }

  static async fetchAppointments(payload: {
    page: number;
    limit: number;
    patientId?: string;
    role: Role;
    userId: string;
  }) {
    switch (payload.role) {
      case Role.receptionist:
        if (!payload.patientId) {
          throw new BadRequestError('Patient ID is required for receptionists');
        }

        return this.fetchReceptionistAppointments(
          payload.page,
          payload.limit,
          payload.patientId,
        );
      case Role.doctor:
        return this.fetchDoctorAppointments(
          payload.userId,
          payload.page,
          payload.limit,
        );
      default:
        throw new BadRequestError('Invalid role for fetching appointments');
    }
  }

  static async fetchReceptionistAppointment(appointmentId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: ReceptionistAppointmentInclude,
    });

    if (!appointment) {
      throw new BadRequestError('Appointment not found');
    }

    return receptionistAppointmentMapper(appointment);
  }

  static async fetchDoctorAppointment(doctorId: string, appointmentId: string) {
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: DoctorAppointmentInclude,
    });

    if (!appointment) {
      throw new BadRequestError('Appointment not found');
    }

    if (appointment.doctorId !== doctorId) {
      throw new NotFoundError('Appointment not found for this doctor');
    }

    return doctorAppointmentMapper(appointment);
  }

  static async fetchAppointment(payload: {
    appointmentId: string;
    role: Role;
    userId: string;
  }) {
    const { appointmentId, role, userId } = payload;

    switch (role) {
      case Role.receptionist:
        return this.fetchReceptionistAppointment(appointmentId);
      case Role.doctor:
        return this.fetchDoctorAppointment(userId, appointmentId);
      default:
        throw new BadRequestError('Invalid role for fetching appointment');
    }
  }

  static async updateReceptionistAppointment(payload: {
    appointmentId: string;
    payload: UpdateAppointmentDto;
  }) {
    const updateAppointment = updateAppointmentSchema.parse(payload.payload);

    const appointment = await prisma.appointment.findUnique({
      where: { id: payload.appointmentId },
    });

    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: payload.appointmentId },
      data: updateAppointment,
      include: ReceptionistAppointmentInclude,
    });

    return receptionistAppointmentMapper(updatedAppointment);
  }

  static async updateDoctorAppointment(payload: {
    appointmentId: string;
    payload: UpdateAppointmentDto;
    doctorId: string;
  }) {
    const updateAppointment = updateAppointmentSchema.parse(payload.payload);

    const appointment = await prisma.appointment.findUnique({
      where: { id: payload.appointmentId },
    });

    if (!appointment) {
      throw new NotFoundError('Appointment not found');
    }

    if (appointment.doctorId !== payload.doctorId) {
      throw new NotFoundError('Appointment not found for this doctor');
    }

    const updatedAppointment = await prisma.appointment.update({
      where: { id: payload.appointmentId },
      data: updateAppointment,
      include: DoctorAppointmentInclude,
    });

    return doctorAppointmentMapper(updatedAppointment);
  }

  static async updateAppointment(payload: {
    appointmentId: string;
    payload: UpdateAppointmentDto;
    role: Role;
    userId: string;
  }) {
    const { appointmentId, payload: updatePayload, role, userId } = payload;
    switch (role) {
      case Role.receptionist:
        return this.updateReceptionistAppointment({
          appointmentId,
          payload: updatePayload,
        });
      case Role.doctor:
        return this.updateDoctorAppointment({
          appointmentId,
          payload: updatePayload,
          doctorId: userId,
        });
      default:
        throw new BadRequestError('Invalid role for updating appointment');
    }
  }
}

export default AppointmentService;
