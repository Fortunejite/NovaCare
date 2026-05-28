export interface DepartmentDto {
  id: string;
  name: string;
  description: string | null;
}

export type DepartmentsResponse = DepartmentDto[];