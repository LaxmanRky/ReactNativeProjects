import { firestore, auth } from './firebase';
import { 
  Appointment, 
  AppointmentStatus, 
  Doctor, 
  TimeSlot 
} from '../types/AppointmentTypes';
import { nanoid } from 'nanoid';

// Generate a unique appointment ID
const generateAppointmentId = () => {
  return `APT-${nanoid(8)}`.toUpperCase();
};

export const appointmentService = {
  /**
   * Get all doctors
   */
  getDoctors: async (): Promise<Doctor[]> => {
    try {
      const querySnapshot = await firestore()
        .collection('doctors')
        .get();
      
      const doctors: Doctor[] = [];
      
      querySnapshot.forEach((doc) => {
        const doctorData = doc.data() as Omit<Doctor, 'id'>;
        doctors.push({
          ...doctorData,
          id: doc.id
        });
      });
      
      return doctors;
    } catch (error) {
      console.error('Error getting doctors:', error);
      throw error;
    }
  },

  /**
   * Get a specific doctor by ID
   */
  getDoctorById: async (doctorId: string): Promise<Doctor | null> => {
    try {
      const docRef = await firestore()
        .collection('doctors')
        .doc(doctorId)
        .get();
      
      if (docRef.exists) {
        const doctorData = docRef.data() as Omit<Doctor, 'id'>;
        return {
          ...doctorData,
          id: docRef.id
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting doctor:', error);
      throw error;
    }
  },

  /**
   * Book a new appointment
   */
  bookAppointment: async (
    doctorId: string,
    date: string,
    timeSlot: TimeSlot,
    reason?: string
  ): Promise<string> => {
    try {
      const currentUser = auth().currentUser;
      
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      // Get doctor data
      const doctor = await appointmentService.getDoctorById(doctorId);
      
      if (!doctor) {
        throw new Error('Doctor not found');
      }
      
      // Generate a unique appointment ID
      const appointmentId = generateAppointmentId();
      
      // Create the appointment object
      const appointment: Appointment = {
        id: appointmentId,
        doctorId,
        doctorName: doctor.name,
        doctorSpecialty: doctor.specialty,
        patientId: currentUser.uid,
        patientName: currentUser.displayName || 'Patient',
        date,
        timeSlot,
        status: AppointmentStatus.SCHEDULED,
        reason,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Save to appointments collection
      await firestore()
        .collection('appointments')
        .doc(appointmentId)
        .set(appointment);
      
      // Add to user's appointments list
      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('appointments')
        .doc(appointmentId)
        .set({
          appointmentId,
          doctorName: doctor.name,
          date,
          status: AppointmentStatus.SCHEDULED,
          createdAt: new Date().toISOString(),
        });
      
      // Add to doctor's appointments list
      await firestore()
        .collection('doctors')
        .doc(doctorId)
        .collection('appointments')
        .doc(appointmentId)
        .set({
          appointmentId,
          patientName: currentUser.displayName || 'Patient',
          date,
          status: AppointmentStatus.SCHEDULED,
          createdAt: new Date().toISOString(),
        });
      
      return appointmentId;
    } catch (error) {
      console.error('Error booking appointment:', error);
      throw error;
    }
  },

  /**
   * Get user's appointments
   */
  getUserAppointments: async (): Promise<Appointment[]> => {
    try {
      const currentUser = auth().currentUser;
      
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      const querySnapshot = await firestore()
        .collection('appointments')
        .where('patientId', '==', currentUser.uid)
        .orderBy('date', 'desc')
        .get();
      
      const appointments: Appointment[] = [];
      
      querySnapshot.forEach((doc) => {
        appointments.push(doc.data() as Appointment);
      });
      
      return appointments;
    } catch (error) {
      console.error('Error getting user appointments:', error);
      throw error;
    }
  },

  /**
   * Get a specific appointment by ID
   */
  getAppointmentById: async (appointmentId: string): Promise<Appointment | null> => {
    try {
      const docRef = await firestore()
        .collection('appointments')
        .doc(appointmentId)
        .get();
      
      if (docRef.exists) {
        return docRef.data() as Appointment;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting appointment:', error);
      throw error;
    }
  },

  /**
   * Update appointment status
   */
  updateAppointmentStatus: async (
    appointmentId: string,
    status: AppointmentStatus,
    notes?: string
  ): Promise<void> => {
    try {
      const currentUser = auth().currentUser;
      
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      
      const appointment = await appointmentService.getAppointmentById(appointmentId);
      
      if (!appointment) {
        throw new Error('Appointment not found');
      }
      
      // Ensure user is authorized to update this appointment
      if (appointment.patientId !== currentUser.uid) {
        throw new Error('Unauthorized to update this appointment');
      }
      
      // Update in main appointments collection
      await firestore()
        .collection('appointments')
        .doc(appointmentId)
        .update({
          status,
          notes: notes || appointment.notes,
          updatedAt: new Date().toISOString(),
        });
      
      // Update in user's appointments
      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('appointments')
        .doc(appointmentId)
        .update({
          status,
          updatedAt: new Date().toISOString(),
        });
      
      // Update in doctor's appointments
      await firestore()
        .collection('doctors')
        .doc(appointment.doctorId)
        .collection('appointments')
        .doc(appointmentId)
        .update({
          status,
          updatedAt: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error updating appointment status:', error);
      throw error;
    }
  },

  /**
   * Cancel an appointment
   */
  cancelAppointment: async (appointmentId: string, reason?: string): Promise<void> => {
    try {
      await appointmentService.updateAppointmentStatus(
        appointmentId,
        AppointmentStatus.CANCELLED,
        reason
      );
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      throw error;
    }
  },

  /**
   * Add mock doctors to Firestore (for development/testing)
   */
  addMockDoctors: async (): Promise<void> => {
    try {
      const mockDoctors: Omit<Doctor, 'id'>[] = [
        {
          name: 'Dr. Emma Richardson',
          specialty: 'Cardiologist',
          profileImage: 'https://randomuser.me/api/portraits/women/68.jpg',
          qualifications: 'MD, FACC',
          experience: '12 years',
          clinicAddress: '123 Medical Center Dr, Suite 101',
          rating: 4.8,
          reviewCount: 124,
          fee: 150,
          availability: [
            {
              day: 'Monday',
              slots: [
                { id: '1', startTime: '09:00', endTime: '09:30', isBooked: false },
                { id: '2', startTime: '09:30', endTime: '10:00', isBooked: false },
                { id: '3', startTime: '10:00', endTime: '10:30', isBooked: false },
                { id: '4', startTime: '10:30', endTime: '11:00', isBooked: false },
              ]
            },
            {
              day: 'Wednesday',
              slots: [
                { id: '5', startTime: '14:00', endTime: '14:30', isBooked: false },
                { id: '6', startTime: '14:30', endTime: '15:00', isBooked: false },
                { id: '7', startTime: '15:00', endTime: '15:30', isBooked: false },
                { id: '8', startTime: '15:30', endTime: '16:00', isBooked: false },
              ]
            }
          ]
        },
        {
          name: 'Dr. James Wilson',
          specialty: 'Dermatologist',
          profileImage: 'https://randomuser.me/api/portraits/men/32.jpg',
          qualifications: 'MD, FAAD',
          experience: '8 years',
          clinicAddress: '456 Health Parkway, Unit 202',
          rating: 4.6,
          reviewCount: 98,
          fee: 120,
          availability: [
            {
              day: 'Tuesday',
              slots: [
                { id: '9', startTime: '09:00', endTime: '09:30', isBooked: false },
                { id: '10', startTime: '09:30', endTime: '10:00', isBooked: false },
                { id: '11', startTime: '10:00', endTime: '10:30', isBooked: false },
              ]
            },
            {
              day: 'Thursday',
              slots: [
                { id: '12', startTime: '13:00', endTime: '13:30', isBooked: false },
                { id: '13', startTime: '13:30', endTime: '14:00', isBooked: false },
                { id: '14', startTime: '14:00', endTime: '14:30', isBooked: false },
              ]
            }
          ]
        },
        {
          name: 'Dr. Sarah Johnson',
          specialty: 'Pediatrician',
          profileImage: 'https://randomuser.me/api/portraits/women/42.jpg',
          qualifications: 'MD, FAAP',
          experience: '15 years',
          clinicAddress: '789 Children\'s Way, Suite 305',
          rating: 4.9,
          reviewCount: 215,
          fee: 135,
          availability: [
            {
              day: 'Monday',
              slots: [
                { id: '15', startTime: '13:00', endTime: '13:30', isBooked: false },
                { id: '16', startTime: '13:30', endTime: '14:00', isBooked: false },
                { id: '17', startTime: '14:00', endTime: '14:30', isBooked: false },
              ]
            },
            {
              day: 'Friday',
              slots: [
                { id: '18', startTime: '09:00', endTime: '09:30', isBooked: false },
                { id: '19', startTime: '09:30', endTime: '10:00', isBooked: false },
                { id: '20', startTime: '10:00', endTime: '10:30', isBooked: false },
              ]
            }
          ]
        }
      ];
      
      // Add each doctor to Firestore
      for (const doctor of mockDoctors) {
        await firestore()
          .collection('doctors')
          .add(doctor);
      }
    } catch (error) {
      console.error('Error adding mock doctors:', error);
      throw error;
    }
  }
}; 