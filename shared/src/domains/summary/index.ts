export interface DoctorSummaryDto {
  todayCompletedAppointments: number;
  todayScheduledAppointments: number;
  todayPendingAppointments: number;
  totalConsultations: number;
  pendingLabRequests: number;
  pendingPrescriptions: number;
}

export interface PharmacistSummaryDto {
  totalDispensedByMe: number;
  totalPendingPrescriptions: number;
  totalMedications: number;
  outOfStockMedications: number;
}

export interface LabTechnicianSummaryDto {
  totalCompletedByMe: number;
  totalPendingAssignedToMe: number;
  totalPendingUnassigned: number;
  totalLabRequests: number;
}
