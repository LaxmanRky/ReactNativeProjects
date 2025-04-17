export interface Doctor {
  id: string;
  name: string;
  department: string;
  experience: number;
  education: string;
  image: string;
  online: boolean;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface Appointment {
  id: string;
  appointmentDate: string;
  createdAt: number;
  department: string;
  doctorId: string | null;
  doctorName: string;
  online: boolean;
  reason: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  timeSlot: string;
} 