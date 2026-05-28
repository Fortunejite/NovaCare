import { BadRequestError, NotFoundError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { departmentMapper } from '@/mapper/department';
import {
  CreateDepartmentDto,
  createDepartmentSchema,
  DepartmentDto,
  DepartmentsResponse,
  UpdateDepartmentDto,
  updateDepartmentSchema,
} from '@app/shared';

class DepartmentController {
  static async createDepartment(payload: CreateDepartmentDto): Promise<DepartmentDto> {
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
    });

    return departmentMapper(department);
  }

  static async getAllDepartments(): Promise<DepartmentsResponse> {
    const departments = await prisma.department.findMany();
    return departments.map(departmentMapper);
  }

  static async getDepartmentById(id: string): Promise<DepartmentDto> {
    const department = await prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      throw new NotFoundError('Department not found');
    }

    return departmentMapper(department);
  }

  static async updateDepartment(id: string, payload: UpdateDepartmentDto): Promise<DepartmentDto> {
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
    });

    return departmentMapper(department);
  }

  static async deleteDepartment(id: string): Promise<void> {
    const [existingDepartment, doctor] = await Promise.all([
      prisma.department.findUnique({
        where: { id },
      }),
      prisma.doctor.findFirst({
        where: { departmentId: id },
      }),
    ]);

    if (!existingDepartment) {
      throw new NotFoundError('Department not found');
    }

    if (doctor) {
      throw new BadRequestError('Cannot delete department with assigned doctors');
    }

    await prisma.department.delete({
      where: { id },
    });

    return;
  }
}

export default DepartmentController;
