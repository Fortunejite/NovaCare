import { PagedResponse } from '../../shared';

export * from './medicine.validation';

export interface MedicineDto {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number;
  weight: number | null; // in grams
}

export type MedicineResponseDto = PagedResponse<MedicineDto>;