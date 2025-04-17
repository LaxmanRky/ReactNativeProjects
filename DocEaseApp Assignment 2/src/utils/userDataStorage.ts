import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';
import { auth, db } from '../firebase/config';
import { FirebaseAuthTypes } from '@react-native-firebase/auth';

/**
 * Helper functions for storing and retrieving user-specific data
 */

// Appointment types
export interface AppointmentFormData {
  doctorId: string;
  doctorName: string;
  department: string;
  patientName: string;
  phoneNumber: string;
  email: string;
  appointmentDate: string;
  timeSlot: string;
  reason: string;
  appointmentType: string;
  online: boolean;
}

export interface AppointmentData extends AppointmentFormData {
  id?: string;
  userId: string;
  userEmail: string;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
}

/**
 * Save an appointment for the current user
 * @param appointmentData Appointment data to save
 * @returns The ID of the created appointment
 */
export const saveUserAppointment = async (appointmentData: AppointmentFormData): Promise<string | null> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const appointment: AppointmentData = {
      ...appointmentData,
      userId: currentUser.uid,
      userEmail: currentUser.email || '',
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    // Store in user-specific subcollection
    const userAppointmentsRef = db.collection('users').doc(currentUser.uid).collection('appointments');
    const docRef = await userAppointmentsRef.add(appointment);

    // Also store in global appointments collection
    const globalAppointmentsRef = db.collection('appointments');
    await globalAppointmentsRef.add({
      ...appointment,
      appointmentId: docRef.id
    });

    return docRef.id;
  } catch (error) {
    console.error('Error saving appointment:', error);
    return null;
  }
};

/**
 * Get all appointments for the current user
 * @returns Array of user appointments
 */
export const getUserAppointments = async (): Promise<AppointmentData[]> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const userAppointmentsRef = db.collection('users').doc(currentUser.uid).collection('appointments');
    const querySnapshot = await userAppointmentsRef.get();
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as AppointmentData[];
  } catch (error) {
    console.error('Error fetching user appointments:', error);
    return [];
  }
};

/**
 * Cancel a user appointment
 * @param appointmentId ID of the appointment to cancel
 * @returns Whether the cancellation was successful
 */
export const cancelUserAppointment = async (appointmentId: string): Promise<boolean> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new Error('User not authenticated');
    }

    const appointmentRef = db.collection('users').doc(currentUser.uid).collection('appointments').doc(appointmentId);
    await appointmentRef.update({
      status: 'cancelled',
      cancelledAt: new Date().toISOString()
    });

    // Also update in global appointments
    const globalAppointmentsRef = db.collection('appointments');
    const querySnapshot = await globalAppointmentsRef.where('appointmentId', '==', appointmentId).get();
    
    if (!querySnapshot.empty) {
      const globalAppointmentDoc = querySnapshot.docs[0];
      await globalAppointmentDoc.ref.update({
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      });
    }

    return true;
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    return false;
  }
};

/**
 * Check if current user is authenticated
 * @returns Current user or null
 */
export const getCurrentUser = (): FirebaseAuthTypes.User | null => {
  return auth.currentUser;
}; 