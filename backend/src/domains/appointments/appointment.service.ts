import { prisma } from '@/lib/prisma';
import {
  ReceptionistAppointmentDto,
  CreateAppointmentDto,
  createAppointmentSchema,
  pageResponseMapper,
} from '@app/shared';
import {
  receptionistAppointmentMapper,
  ReceptionistAppointmentInclude,
} from './appointment.mapper';
import { BadRequestError } from '@/lib/errors';
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

  static async fetchAppointments(payload: {
    page: number;
    limit: number;
    patientId?: string;
    role: Role;
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
      default:
        throw new BadRequestError('Invalid role for fetching appointments');
    };
  }
}

export default AppointmentService;
