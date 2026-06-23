export type Role = 'admin' | 'patient' | 'doctor' | 'pharmacist' | 'labTechnician' | 'receptionist';

export type UserStatus = 'active' | 'blocked'

export type PatientStatus = 'active' | 'discharged' | 'deceased' | 'admitted';

export type PrescriptionStatus = 'pending' | 'dispensed' | 'cancelled';

export type LabRequestStatus = 'pending' | 'completed' | 'cancelled';

export const labTests = [
  "blood_test",
  "urine_test",
  "x_ray",
  "mri",
  "ct_scan",
  "ecg",
  "ultrasound",
  "biopsy",
  "genetic_test",
  "allergy_test",
  "pathology_test",
]


export type LabTestType = typeof labTests[number];