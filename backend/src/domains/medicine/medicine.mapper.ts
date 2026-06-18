import { MedicineDto } from "@app/shared";
import { Medication } from "@prisma/client";

export const medicineMapper = (payload: Medication): MedicineDto => ({
  id: payload.id,
  name: payload.name,
  description: payload.description,
  price: payload.price,
  stockQuantity: payload.stockQuantity,
  weight: payload.weight,
})