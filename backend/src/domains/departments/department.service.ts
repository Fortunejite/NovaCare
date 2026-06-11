import { BadRequestError, NotFoundError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import {
  CreateDepartmentDto,
  createDepartmentSchema,
  DepartmentDto,
  DepartmentsResponse,
  UpdateDepartmentDto,
  updateDepartmentSchema,
} from '@app/shared';
import { departmentMapper } from './department.mapper';

class DepartmentService {
  private static include = {
    _count: { select: { doctors: true } },
  };

  static async createDepartment(
    payload: CreateDepartmentDto,
  ): Promise<DepartmentDto> {
    const data = createDepartmentSchema.parse(payload);

    const existingDepartment = await prisma.department.findUnique({
      where: { name: data.name },
    });
    if (existingDepartment) {
      throw new BadRequestError('Department with this name already exists');
    }

    const department = await prisma.department.create({
      data: {
        name: data.name,
        description: data.description,
      },
      include: this.include,
    });

    return departmentMapper(department);
  }

  static async getAllDepartments(): Promise<DepartmentsResponse> {
    const departments = await prisma.department.findMany({
      include: this.include,
    });
    return departments.map(departmentMapper);
  }

  static async getDepartmentById(id: string): Promise<DepartmentDto> {
    const department = await prisma.department.findUnique({
      where: { id },
      include: this.include,
    });

    if (!department) {
      throw new NotFoundError('Department not found');
    }

    return departmentMapper(department);
  }

  static async updateDepartment(
    id: string,
    payload: UpdateDepartmentDto,
  ): Promise<DepartmentDto> {
    const data = updateDepartmentSchema.parse(payload);

    const existingDepartment = await prisma.department.findUnique({
      where: { id },
    });
    if (!existingDepartment) {
      throw new NotFoundError('Department not found');
    }

    const department = await prisma.department.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
      include: this.include,
    });

    return departmentMapper(department);
  }

  static async deleteDepartment(id: string): Promise<void> {
    const existingDepartment = await prisma.department.findUnique({
      where: { id },
    });

    if (!existingDepartment) {
      throw new NotFoundError('Department not found');
    }

    try {
      await prisma.department.delete({
        where: { id },
      });
    } catch (error) {
      throw new BadRequestError(
        'Cannot delete department with assigned doctors. Please reassign doctors before deleting this department.',
      );
    }

    return;
  }
}

export default DepartmentService;
