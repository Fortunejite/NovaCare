import { LabTestType } from '@prisma/client';

export const labTypeCosts: Record<LabTestType, number> = {
  blood_test: 50,
  urine_test: 30,
  x_ray: 100,
  mri: 500,
  ct_scan: 400,
  ecg: 80,
  ultrasound: 150,
  biopsy: 200,
  genetic_test: 250,
  allergy_test: 100,
  pathology_test: 180,
};
