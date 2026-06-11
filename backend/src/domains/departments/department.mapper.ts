import { DepartmentDto } from "@app/shared";
import { Department } from "@prisma/client";

type DepartmentWithDoctorCount = Department & {
  _count: {
    doctors: number;
  }
}

export const departmentMapper = (department: DepartmentWithDoctorCount): DepartmentDto => ({
  id: department.id,
  name: department.name,
  description: department.description,
  doctorCount: department._count.doctors,
});