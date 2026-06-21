import { BadRequestError, NotFoundError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import {
  createLabRequestSchema,
  CreateLabRequestSchemaDto,
  labRequestStatusSchema,
  LabTechnicianLabRequestDto,
  LabTechnicianLabRequestResponse,
  pageResponseMapper,
} from '@app/shared';
import { LabRequestStatus, LabTestType, Prisma } from '@prisma/client';
import { labRequestMapper, LabTechnicianLabRequestInclude, labTechnicianLabRequestMapper } from './labRequests.mapper';

class LabRequestsService {
  static async createlabRequest(
    payload: CreateLabRequestSchemaDto,
    userId: string,
  ) {
    const data = createLabRequestSchema.parse(payload);

    const [patientExists, doctor] = await Promise.all([
      await prisma.patient.findUnique({
        where: { id: data.patientId },
        select: { id: true },
      }),
      await prisma.doctor.findFirst({
        where: { userId },
        select: { id: true },
      }),
    ]);

    if (!patientExists) {
      throw new NotFoundError('Patient not found');
    }

    if (!doctor) {
      throw new NotFoundError('Doctor not found');
    }

    const newLabRequestData = {
      ...data,
      testType: data.testType as LabTestType,
      doctorId: doctor.id,
    };

    // assign to first available lab technician for now; requires better assignment logic later
    const technician = await prisma.labTechnician.findFirst({ select: { id: true } });
    if (!technician) {
      throw new BadRequestError('No lab technician available. Please create a lab technician before creating lab requests.');
    }

    const labRequest = await prisma.labRequest.create({
      data: { ...newLabRequestData, labTechnicianId: technician.id },
    });

    return labRequestMapper(labRequest);
  }

  static async getAllLabRequests(payload: {
    page: number;
    limit: number;
    status?: string;
  }): Promise<LabTechnicianLabRequestResponse> {
    const { page, limit, status } = payload;
    const skip = (page - 1) * limit;

    const statusFilter = status
      ? (labRequestStatusSchema.parse(status) as LabRequestStatus)
      : null;

    const where: Prisma.LabRequestWhereInput = statusFilter
      ? { status: statusFilter }
      : {};

    const [labRequests, total] = await Promise.all([
      prisma.labRequest.findMany({
        where,
        include: LabTechnicianLabRequestInclude,
        skip,
        take: limit,
      }),
      prisma.labRequest.count({
        where,
      }),
    ]);

    return pageResponseMapper({
      data: labRequests.map(labTechnicianLabRequestMapper),
      total,
      page,
      limit,
    });
  }

  static async getLabRequestById(
    labRequestId: string,
  ): Promise<LabTechnicianLabRequestDto> {
    const labRequest = await prisma.labRequest.findUnique({
      where: { id: labRequestId },
      include: LabTechnicianLabRequestInclude,
    });
    if (!labRequest) {
      throw new NotFoundError('Lab request not found');
    }

    return labTechnicianLabRequestMapper(labRequest);
  }
  static async generateLabResult(labRequestId: string, resultData: string): Promise<LabTechnicianLabRequestDto> {
    const labRequest = await prisma.labRequest.findUnique({ where: { id: labRequestId } });

    if (!labRequest) throw new NotFoundError('Lab request not found');

    if (labRequest.status === 'completed') {
      throw new BadRequestError('Lab result has already been generated for this request');
    }

    // create lab result and update request status atomically
    const updated = await prisma.$transaction(async (tx) => {
      const labResult = await tx.labResult.create({
        data: { labRequestId, resultData },
      });

      const req = await tx.labRequest.update({
        where: { id: labRequestId },
        data: { status: 'completed' },
      });

      return { labResult, req };
    });

    const found = await prisma.labRequest.findUnique({
      where: { id: labRequestId },
      include: LabTechnicianLabRequestInclude,
    });

    if (!found) throw new Error('Unexpected error fetching updated lab request');

    return labTechnicianLabRequestMapper(found);
  }
}

export default LabRequestsService;
