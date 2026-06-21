import { BadRequestError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import {
  createConsultationSchema,
  CreateConsultationSchemaDto,
} from '@app/shared';
import {
  DoctorConsultationInclude,
  doctorConsultationMapper,
} from './consultaions.mapper';

class ConsultaionService {
  static async createConsultaion(userId: string, payload: CreateConsultationSchemaDto) {
    const { prescriptions, ...data } = createConsultationSchema.parse(payload);

    const doctorId = await prisma.doctor.findFirst({
      where: { userId },
      select: { id: true },
    }).then((doc) => doc?.id);
    
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

        await tx.prescribedItems.createMany({
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
}

export default ConsultaionService;
