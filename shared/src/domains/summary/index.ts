export interface DoctorSummaryDto {
  todayCompletedAppointments: number;
  todayScheduledAppointments: number;
}

export interface PharmacistSummaryDto {
  totalDispensedByMe: number;
  totalPendingPrescriptions: number;
  totalMedications: number;
  outOfStockMedications: number;
}