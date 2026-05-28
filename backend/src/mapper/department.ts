import { DepartmentDto } from "@app/shared";
import { Department } from "@prisma/client";

export const departmentMapper = (department: Department): DepartmentDto => ({
  id: department.id,
  name: department.name,
  description: department.description,
});