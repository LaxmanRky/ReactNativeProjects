export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  profileImage?: string;
  qualifications?: string;
  experience?: string;
  clinicAddress?: string;
  availability?: Availability[];
  rating?: number;
  reviewCount?: number;
  fee?: number;
}

export interface Availability {
  day: string;
  slots: TimeSlot[];
}

export interface TimeSlot {
  id: string;
  startTime: string;
  endTime: string;
  isBooked: boolean;
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  patientId: string;
  patientName: string;
  date: string;
  timeSlot: TimeSlot;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export enum AppointmentStatus {
  SCHEDULED = 'scheduled',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no-show'
} 