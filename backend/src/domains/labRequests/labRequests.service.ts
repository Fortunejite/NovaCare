import { BadRequestError, NotFoundError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import {
  createLabRequestSchema,
  CreateLabRequestSchemaDto,
  LabRequestDto,
  LabTechnicianLabRequestDto,
  LabTechnicianLabRequestResponse,
  pageResponseMapper,
} from '@app/shared';
import { LabTestType, Prisma } from '@prisma/client';
import LabTestMapper, {
  LabTechnicianLabRequestInclude,
} from './labRequests.mapper';

class LabRequestsService {
  static async createlabRequest(
    payload: CreateLabRequestSchemaDto,
  ): Promise<LabRequestDto> {
    const data = createLabRequestSchema.parse(payload);

    const labRequest = await prisma.labRequest.create({
      data: {
        consultationId: data.consultationId,
        testType: data.testType as LabTestType,
      },
    });

    return LabTestMapper.toLabRequestDto(labRequest);
  }

  static async getAllLabRequests(payload: {
    userId: string;
    page: number;
    limit: number;
    status?: string;
  }): Promise<LabTechnicianLabRequestResponse> {
    const { userId, page, limit, status } = payload;
    const skip = (page - 1) * limit;

    let where: Prisma.LabRequestWhereInput = {};

    if (status === 'pending') {
      where = { status };
    } else {
      const labTechnician = await prisma.labTechnician.findFirst({
        where: { userId },
      });

      if (!labTechnician) {
        throw new NotFoundError('Lab technician not found');
      }

      const labTechnicianId = labTechnician.id;
      if (status === 'completed') {
        where = { labTechnicianId, status: 'completed' };
      } else {
        where = { OR: [{ labTechnicianId }, { status: 'pending' }] };
      }
    }
    const [labRequests, total] = await Promise.all([
      prisma.labRequest.findMany({
        where,
        include: LabTechnicianLabRequestInclude,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.labRequest.count({
        where,
      }),
    ]);

    return pageResponseMapper({
      data: labRequests.map(LabTestMapper.toLabRequestDetailsDto),
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

    return LabTestMapper.toLabRequestDetailsDto(labRequest);
  }

  static async generateLabResult(
    labRequestId: string,
    resultData: string,
    userId: string,
  ): Promise<LabTechnicianLabRequestDto> {
    const labRequest = await prisma.labRequest.findUnique({
      where: { id: labRequestId },
    });

    if (!labRequest) throw new NotFoundError('Lab request not found');

    if (labRequest.status === 'completed') {
      throw new BadRequestError(
        'Lab result has already been generated for this request',
      );
    }

    const labTechnician = await prisma.labTechnician.findFirst({
      where: { userId },
    });

    if (!labTechnician) {
      throw new NotFoundError('Lab technician not found');
    }

    const labTechnicianId = labTechnician.id;

    // create lab result and update request status atomically
    await prisma.$transaction(async (tx) => {
      const labResult = await tx.labResult.create({
        data: { labRequestId, resultData },
      });

      const req = await tx.labRequest.update({
        where: { id: labRequestId },
        data: { status: 'completed', labTechnicianId },
      });

      return { labResult, req };
    });

    const found = await prisma.labRequest.findUnique({
      where: { id: labRequestId },
      include: LabTechnicianLabRequestInclude,
    });

    if (!found)
      throw new Error('Unexpected error fetching updated lab request');

    return LabTestMapper.toLabRequestDetailsDto(found);
  }
}

export default LabRequestsService;
