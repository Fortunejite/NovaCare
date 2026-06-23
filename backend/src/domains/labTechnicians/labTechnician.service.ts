import { prisma } from '@/lib/prisma';
import { NotFoundError } from '@/lib/errors';
import {
  CreateLabTechnicianDto,
  LabTechnicianDto,
  createLabTechnicianSchema,
  LabTechniciansResponse,
  UpdateLabTechnicianDto,
  updateLabTechnicianSchema,
  pageResponseMapper,
} from '@app/shared';
import { createNewUser, updateUserEmail } from '../auth';
import { labTechnicianMapper } from './labTechnician';

class LabTechnicianService {
  private static include = { user: true };

  static async createLabTechnician(
    payload: CreateLabTechnicianDto,
  ): Promise<LabTechnicianDto> {
    const { email, ...data } = createLabTechnicianSchema.parse(payload);

    const newUser = await createNewUser(
      email,
      `${data.firstName} ${data.lastName}`,
      'labTechnician',
    );

    const labTechnicianProfile = await prisma.labTechnician.create({
      data: { ...data, userId: newUser.id },
      include: this.include,
    });

    return labTechnicianMapper(labTechnicianProfile);
  }

  static async getAllLabTechnicians(
    page = 1,
    limit = 10,
  ): Promise<LabTechniciansResponse> {
    const [labTechnicians, total] = await Promise.all([
      prisma.labTechnician.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: this.include,
      }),
      prisma.labTechnician.count(),
    ]);

    const data = pageResponseMapper({
      data: labTechnicians.map(labTechnicianMapper),
      page,
      limit,
      total,
    });

    return data;
  }

  static async getLabTechnicianById(id: string): Promise<LabTechnicianDto> {
    const labTechnician = await prisma.labTechnician.findUnique({
      where: { id },
      include: this.include,
    });

    if (!labTechnician) {
      throw new NotFoundError('Lab Technician not found');
    }

    return labTechnicianMapper(labTechnician);
  }

  static async getLabTechnicianByUserId(userId: string): Promise<LabTechnicianDto> {
    const labTechnician = await prisma.labTechnician.findUnique({
      where: { userId },
      include: this.include,
    });

    if (!labTechnician) {
      throw new NotFoundError('Lab Technician profile not found');
    }

    return labTechnicianMapper(labTechnician);
  }

  static async updateLabTechnician(
    id: string,
    payload: UpdateLabTechnicianDto,
  ): Promise<LabTechnicianDto> {
    const { email, ...data } = updateLabTechnicianSchema.parse(payload);
    const labTechnician = await prisma.labTechnician.findUnique({
      where: { id },
      include: { user: { select: { email: true } } },
    });

    if (!labTechnician) {
      throw new NotFoundError('Lab Technician not found');
    }

    if (email && email !== labTechnician.user.email) {
      await updateUserEmail(labTechnician.userId, email);
    }

    const updatedLabTechnician = await prisma.labTechnician.update({
      where: { id },
      data: data,
      include: this.include,
    });

    return labTechnicianMapper(updatedLabTechnician);
  }
}

export default LabTechnicianService;
