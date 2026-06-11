export * from './appointment.validation';

export interface AppointmentDto {
  id: string;
  patientId: string;
  doctorId: string;
  receptionistId: string;
  date: Date;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}
