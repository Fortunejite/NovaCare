import { BadRequestError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import {
  createConsultationSchema,
  CreateConsultationSchemaDto,
  ConsultationsResponse,
  pageResponseMapper,
  updateConsultationSchema,
  UpdateConsultationSchemaDto,
} from '@app/shared';
import {
  DoctorConsultationInclude,
  doctorConsultationMapper,
} from './consultaions.mapper';
import { isPastDate } from '@/lib/datetime';

class ConsultaionService {
  private static async getDoctorProfileId(userId: string) {
    const doctor = await prisma.doctor.findFirst({
      where: { userId },
      select: { id: true },
    });

    if (!doctor) {
      throw new BadRequestError('Doctor not found');
    }

    return doctor.id;
  }

  static async createConsultaion(userId: string, payload: CreateConsultationSchemaDto) {
    const { prescriptions, ...data } = createConsultationSchema.parse(payload);

    const doctorId = await this.getDoctorProfileId(userId);
    
    const appointment = await prisma.appointment.findUnique({
      where: { id: data.appointmentId },
    });

    if (!appointment || appointment.doctorId !== doctorId) {
      throw new BadRequestError('Appointment not found');
    } else if (appointment.status !== 'scheduled') {
      throw new BadRequestError('Only scheduled appointments can be used to create consultations');
    }

    const now = new Date();
    if (isPastDate(appointment.datetime)) {
      await prisma.appointment.update({
        where: { id: appointment.id },
        data: { status: 'cancelled' },
      });
      throw new BadRequestError('Appointment date or time has passed. The appointment has been cancelled. Please reschedule the appointment to create a consultation');
    }

    let consultationId = '';
    await prisma.$transaction(async (tx) => {
      await tx.appointment.update({
        where: { id: appointment.id },
        data: { status: 'progress' },
      });

      const consultaton = await tx.consultation.create({ data });
      consultationId = consultaton.id;

      if (prescriptions) {
        const prescription = await tx.prescription.create({
          data: {
            consultationId,
          },
        });

        await tx.prescribedItem.createMany({
          data: prescriptions.map((pres) => ({
            prescriptionId: prescription.id,
            ...pres,
          })),
        });
      }
    });

    const consultaton = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: DoctorConsultationInclude,
    });

    return doctorConsultationMapper(consultaton!);
  }

  static async getConsultations(payload: {
    userId: string;
    page: number;
    limit: number;
  }): Promise<ConsultationsResponse> {
    const doctorId = await this.getDoctorProfileId(payload.userId);
    const skip = (payload.page - 1) * payload.limit;

    const where = { appointment: { doctorId } };
    const [consultations, total] = await Promise.all([
      prisma.consultation.findMany({
        where,
        include: DoctorConsultationInclude,
        skip,
        take: payload.limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.consultation.count({ where }),
    ]);

    return pageResponseMapper({
      data: consultations.map(doctorConsultationMapper),
      page: payload.page,
      limit: payload.limit,
      total,
    });
  }

  static async getConsultationById(userId: string, consultationId: string) {
    const doctorId = await this.getDoctorProfileId(userId);
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: DoctorConsultationInclude,
    });

    if (!consultation || consultation.appointment.doctorId !== doctorId) {
      throw new BadRequestError('Consultation not found');
    }

    return doctorConsultationMapper(consultation);
  }

  static async updateConsultation(
    userId: string,
    consultationId: string,
    payload: UpdateConsultationSchemaDto,
  ) {
    const doctorId = await this.getDoctorProfileId(userId);
    const data = updateConsultationSchema.parse(payload);
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: { appointment: { select: { doctorId: true, status: true } } },
    });

    if (!consultation || consultation.appointment.doctorId !== doctorId) {
      throw new BadRequestError('Consultation not found');
    }

    if (consultation.appointment.status !== 'progress') {
      throw new BadRequestError('Only consultations in progress can be edited');
    }

    const updated = await prisma.consultation.update({
      where: { id: consultationId },
      data,
      include: DoctorConsultationInclude,
    });

    return doctorConsultationMapper(updated);
  }

  static async markConsultationAsCompleted(userId: string, consultationId: string) {
    const doctorId = await this.getDoctorProfileId(userId);
    const consultation = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: { appointment: { select: { doctorId: true, status: true } } },
    });

    if (!consultation || consultation.appointment.doctorId !== doctorId) {
      throw new BadRequestError('Consultation not found');
    }

    if (consultation.appointment.status !== 'progress') {
      throw new BadRequestError('Only consultations in progress can be marked as completed');
    }

    await prisma.appointment.update({
      where: { id: consultation.appointmentId },
      data: { status: 'completed' },
    });

    const updated = await prisma.consultation.findUnique({
      where: { id: consultationId },
      include: DoctorConsultationInclude,
    });

    return doctorConsultationMapper(updated!);
  }
}

export default ConsultaionService;
