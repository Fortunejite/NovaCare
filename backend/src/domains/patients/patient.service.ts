import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';
import {
  CreatePatientDto,
  PatientDto,
  createPatientSchema,
  PatientsResponse,
  UpdatePatientDto,
  updatePatientSchema,
  pageResponseMapper,
} from '@app/shared';
import { createNewUser, updateUserEmail } from '../auth';
import { patientMapper } from './patient.mapper';

class PatientService {
  private static include = { user: true };

  static async createPatient(payload: CreatePatientDto): Promise<PatientDto> {
    const { email, ...data } = createPatientSchema.parse(payload);

    const newUser = await createNewUser(
      email,
      `${data.firstName} ${data.lastName}`,
      'patient',
    );

    const patientProfile = await prisma.patient.create({
      data: { ...data, userId: newUser.id },
      include: this.include,
    });

    return patientMapper(patientProfile);
  }

  static async getAllPatients(
    page = 1,
    limit = 10,
    search?: string,
  ): Promise<PatientsResponse> {
    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: this.include,
        where: search
          ? {
              OR: [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
              ],
            }
          : undefined,
      }),
      prisma.patient.count({
        where: search
          ? {
              OR: [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
              ],
            }
          : undefined,
      }),
    ]);

    const data = pageResponseMapper({
      data: patients.map(patientMapper),
      page,
      limit,
      total,
    });

    return data;
  }

  static async getPatientById(id: string): Promise<PatientDto> {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: this.include,
    });

    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    return patientMapper(patient);
  }

  static async updatePatient(
    id: string,
    payload: UpdatePatientDto,
  ): Promise<PatientDto> {
    const { email, ...data } = updatePatientSchema.parse(payload);
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: { user: { select: { email: true } } },
    });

    if (!patient) {
      throw new NotFoundError('Patient not found');
    }

    if (email && email !== patient.user.email) {
      await updateUserEmail(patient.userId, email);
    }

    const updatedPatient = await prisma.patient.update({
      where: { id },
      data: data,
      include: this.include,
    });

    return patientMapper(updatedPatient);
  }
}

export default PatientService;
