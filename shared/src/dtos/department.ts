export interface DepartmentDto {
  id: string;
  name: string;
  description: string | null;
  doctorCount: number;
}

export type DepartmentsResponse = DepartmentDto[];