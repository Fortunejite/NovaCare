import { prisma } from '@/lib/prisma';
import {
  CreateDoctorDto,
  createDoctorSchema,
  DoctorDto,
  DoctorsResponse,
  UpdateDoctorDto,
  updateDoctorSchema,
} from '@app/shared';
import AuthController from './auth.controller';
import { NotFoundError } from '@/lib/errors';
import { doctorMapper } from '@/mapper/doctor';
import { pageResponseMapper } from '@/mapper/pagedResponse';

class DoctorController {
  private static include = { user: true, department: true };

  static async createDoctor(payload: CreateDoctorDto): Promise<DoctorDto> {
    const { email, ...data } = createDoctorSchema.parse(payload);

    const newUser = await AuthController.createNewUser(
      email,
      `${data.firstName} ${data.lastName}`,
      'doctor',
    );

    const doctorProfile = await prisma.doctor.create({
      data: { ...data, userId: newUser.id },
      include: this.include,
    });

    return doctorMapper(doctorProfile);
  }

  static async getAllDoctors(page = 1, limit = 10): Promise<DoctorsResponse> {
    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: this.include,
      }),
      prisma.doctor.count(),
    ]);

    const data = pageResponseMapper({
      data: doctors.map(doctorMapper),
      page,
      limit,
      total,
    });

    return data;
  }

  static async getDoctorById(id: string): Promise<DoctorDto> {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: this.include,
    });

    if (!doctor) {
      throw new NotFoundError('Doctor not found');
    }

    return doctorMapper(doctor);
  }

  static async updateDoctor(
    id: string,
    payload: UpdateDoctorDto,
  ): Promise<DoctorDto> {
    const { email, ...data } = updateDoctorSchema.parse(payload);
    const doctor = await prisma.doctor.findUnique({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundError('Doctor not found');
    }

    if (email) {
      await AuthController.updateUserEmail(doctor.userId, email);
    }

    const updatedDoctor = await prisma.doctor.update({
      where: { id },
      data: data,
      include: this.include,
    });

    return doctorMapper(updatedDoctor);
  }
}

export default DoctorController;
