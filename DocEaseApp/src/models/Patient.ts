import { PatientData } from './User';
import firebase, { database } from '../config/firebase';

/**
 * Patient class - Extends the User model with patient-specific functionality
 * Part of the Model in MVC pattern
 */
class Patient {
  private patientData: PatientData;

  constructor(patientData: PatientData) {
    this.patientData = patientData;
  }

  /**
   * Get patient data
   */
  getPatientData(): PatientData {
    return this.patientData;
  }

  /**
   * Save patient data to Firebase Realtime Database
   */
  async saveToDatabase(): Promise<void> {
    try {
      const patientRef = database.ref(`patients/${this.patientData.uid}`);
      
      await patientRef.set({
        ...this.patientData,
        createdAt: this.patientData.createdAt.toISOString(),
        updatedAt: this.patientData.updatedAt.toISOString(),
        dateOfBirth: this.patientData.dateOfBirth ? this.patientData.dateOfBirth.toISOString() : null
      });
    } catch (error) {
      console.error('Error saving patient data:', error);
      throw error;
    }
  }

  /**
   * Update patient data
   */
  async updatePatientData(newData: Partial<PatientData>): Promise<void> {
    try {
      // Update local data
      this.patientData = {
        ...this.patientData,
        ...newData,
        updatedAt: new Date()
      };

      // Update in Firebase Realtime Database
      const patientRef = database.ref(`patients/${this.patientData.uid}`);
      const dataToUpdate = {
        ...newData,
        updatedAt: new Date().toISOString()
      };
      
      await patientRef.update(dataToUpdate);
    } catch (error) {
      console.error('Error updating patient data:', error);
      throw error;
    }
  }

  /**
   * Fetch patient data from Firebase Realtime Database
   */
  static async getPatientById(patientId: string): Promise<Patient | null> {
    try {
      const patientRef = database.ref(`patients/${patientId}`);
      const snapshot = await patientRef.once('value');
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        // Convert ISO strings to Date objects
        const patientData: PatientData = {
          ...data,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt),
          dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : undefined
        };
        
        return new Patient(patientData);
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching patient data:', error);
      throw error;
    }
  }

  /**
   * Add a medical history record
   */
  async addMedicalHistoryRecord(record: string): Promise<void> {
    if (!this.patientData.medicalHistory) {
      this.patientData.medicalHistory = [];
    }
    
    this.patientData.medicalHistory.push(record);
    await this.updatePatientData({ 
      medicalHistory: this.patientData.medicalHistory 
    });
  }

  /**
   * Add an appointment
   */
  async addAppointment(appointmentId: string): Promise<void> {
    if (!this.patientData.appointments) {
      this.patientData.appointments = [];
    }
    
    this.patientData.appointments.push(appointmentId);
    await this.updatePatientData({ 
      appointments: this.patientData.appointments 
    });
  }
}

export default Patient;
