export type Role = 'admin' | 'patient' | 'doctor' | 'pharmacist' | 'labTechnician' | 'receptionist';

export type UserStatus = 'active' | 'blocked'

export type PatientStatus = 'active' | 'discharged' | 'deceased' | 'admitted';

export type PrescriptionStatus = 'pending' | 'dispensed' | 'cancelled';

export type LabRequestStatus = 'pending' | 'completed' | 'cancelled';