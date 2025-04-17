export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  imageUrl: string;
  availability: {
    [date: string]: string[]; // Array of available time slots for each date
  };
  hospital: string;
  address: string;
  fees: number;
  bio: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  reason: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  address?: string;
  dob?: string;
  gender?: 'male' | 'female' | 'other';
  medicalHistory?: string[];
}

export interface Review {
  id: string;
  doctorId: string;
  patientId: string;
  rating: number;
  comment: string;
  createdAt: Date;
} 