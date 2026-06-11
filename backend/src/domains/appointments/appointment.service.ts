import { prisma } from '@/lib/prisma';
import {
  AppointmentDto,
  CreateAppointmentDto,
  createAppointmentSchema,
} from '@app/shared';

class AppointmentService {
  static async createAppointment(
    payload: CreateAppointmentDto,
    receptionistId: string,
  ): Promise<AppointmentDto> {
    const appointment = createAppointmentSchema.parse(payload);

    const newAppointment = await prisma.appointment.create({
      data: { ...appointment, receptionistId },
      include: {
        doctor: { include: { user: true } },
        patient: { include: { user: true } },
      },
    });

    return newAppointment;
  }
}

export default AppointmentService;