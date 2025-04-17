import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  User
} from 'firebase/auth';
import { auth } from './config';
import { createPatient } from './firestoreService';
import { Patient } from '../types/firebase';

// User Registration
export const registerUser = async (
  email: string, 
  password: string, 
  displayName: string,
  phone: string,
  address?: string,
  dob?: string,
  gender?: 'male' | 'female' | 'other'
): Promise<User> => {
  try {
    // Create user with Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;
    
    // Update user profile with display name
    await updateProfile(user, { displayName });
    
    // Create patient document in Firestore
    const patientData: Omit<Patient, 'id'> = {
      name: displayName,
      email,
      phone,
      address,
      dob,
      gender
    };
    
    await createPatient(patientData);
    
    return user;
  } catch (error) {
    throw error;
  }
};

// User Login
export const loginUser = async (email: string, password: string): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

// User Logout
export const logoutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    throw error;
  }
};

// Password Reset
export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
};

// Get Current User
export const getCurrentUser = (): User | null => {
  return auth.currentUser;
}; 