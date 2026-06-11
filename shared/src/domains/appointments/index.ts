export * from './appointment.validation';

export interface ReceptionistAppointmentDto {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  receptionistId: string;
  datetime: Date;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Date;
}

export interface DoctorAppointmentDto {
  id: string;
  patientId: string;
  patientName: string;
  receptionistId: string;
  datetime: Date;
  reason: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Date;
}