/**
 * User model class
 * Represents the data structure for a user in the application
 */
export interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  role: 'patient' | 'doctor' | 'admin';
  phoneNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Patient specific data
 */
export interface PatientData extends UserData {
  role: 'patient';
  medicalHistory?: string[];
  appointments?: string[];
  dateOfBirth?: Date;
  emergencyContact?: string;
  insuranceInfo?: string;
}

/**
 * Doctor specific data
 */
export interface DoctorData extends UserData {
  role: 'doctor';
  specialization?: string;
  patients?: string[];
  schedule?: any;
  qualifications?: string[];
  department?: string;
}

/**
 * User class - Implements the Model in MVC pattern
 */
class User {
  private userData: UserData;

  constructor(userData: UserData) {
    this.userData = userData;
  }

  /**
   * Get user data
   */
  getUserData(): UserData {
    return this.userData;
  }

  /**
   * Update user data
   */
  updateUserData(newData: Partial<UserData>): void {
    this.userData = {
      ...this.userData,
      ...newData,
      updatedAt: new Date()
    };
  }

  /**
   * Check if user is a patient
   */
  isPatient(): boolean {
    return this.userData.role === 'patient';
  }

  /**
   * Check if user is a doctor
   */
  isDoctor(): boolean {
    return this.userData.role === 'doctor';
  }

  /**
   * Check if user is an admin
   */
  isAdmin(): boolean {
    return this.userData.role === 'admin';
  }
}

export default User;
