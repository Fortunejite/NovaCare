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
import { Prisma, Role } from '@prisma/client';

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
    patientId?: string,
    doctorId?: string,
  ) {
    const where = {} as Prisma.AppointmentWhereInput;
    if (patientId) {
      where['patientId'] = patientId;
    }
    if (doctorId) {
      where['doctorId'] = doctorId;
    }
    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: where,
        include: ReceptionistAppointmentInclude,
      }),
      prisma.appointment.count({
        where: where,
      }),
    ]);

    return pageResponseMapper({
      data: appointments.map(receptionistAppointmentMapper),
      page,
      limit,
      total,
    });
  }

  static async fetchDoctorAppointments(userId: string, page = 1, limit = 10) {
    const doctor = await prisma.doctor.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!doctor) {
      throw new NotFoundError('Doctor not found');
    }

    const doctorId = doctor.id;
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
    doctorId?: string;
    role: Role;
    userId: string;
  }) {
    switch (payload.role) {
      case Role.receptionist:
        if (!payload.patientId && !payload.doctorId) {
          throw new BadRequestError('Patient ID or Doctor ID are required for receptionists');
        }

        return this.fetchReceptionistAppointments(
          payload.page,
          payload.limit,
          payload.patientId,
          payload.doctorId,
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

  static async fetchDoctorAppointment(userId: string, appointmentId: string) {
    const doctor = await prisma.doctor.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!doctor) {
      throw new NotFoundError('Doctor not found');
    }

    const doctorId = doctor.id;
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
