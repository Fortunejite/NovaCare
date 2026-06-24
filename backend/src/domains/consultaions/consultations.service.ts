import { BadRequestError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import {
  createConsultationSchema,
  CreateConsultationSchemaDto,
  ConsultationsResponse,
  pageResponseMapper,
} from '@app/shared';
import {
  DoctorConsultationInclude,
  doctorConsultationMapper,
} from './consultaions.mapper';

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

    let consultationId = '';
    await prisma.$transaction(async (tx) => {
      await tx.appointment.update({
        where: { id: appointment.id },
        data: { status: 'completed' },
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
}

export default ConsultaionService;
