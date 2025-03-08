import AuthService from '../services/auth/AuthService';
import User, { UserData } from '../models/User';
import firebase, { database } from '../config/firebase';

/**
 * AuthController class - Handles the business logic for authentication
 * Implements the Controller in MVC pattern
 */
class AuthController {
  /**
   * Register a new user
   * @param email User email
   * @param password User password
   * @param role User role
   * @param displayName Optional display name
   */
  async registerUser(
    email: string, 
    password: string, 
    role: 'patient' | 'doctor' | 'admin', 
    displayName?: string
  ): Promise<User> {
    try {
      // Register user with Firebase Auth
      const userCredential = await AuthService.register(email, password);
      const uid = userCredential.user.uid;
      
      // Create user data
      const userData: UserData = {
        uid,
        email,
        role,
        displayName: displayName || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Save user data to Firebase Realtime Database
      const userRef = database.ref(`users/${uid}`);
      await userRef.set({
        ...userData,
        createdAt: userData.createdAt.toISOString(),
        updatedAt: userData.updatedAt.toISOString()
      });
      
      return new User(userData);
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login a user
   * @param email User email
   * @param password User password
   */
  async loginUser(email: string, password: string): Promise<User | null> {
    try {
      // Login with Firebase Auth
      const userCredential = await AuthService.login(email, password);
      const uid = userCredential.user.uid;
      
      // Get user data from Firebase Realtime Database
      const userRef = database.ref(`users/${uid}`);
      const snapshot = await userRef.once('value');
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        // Convert ISO strings to Date objects
        const userData: UserData = {
          ...data,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt)
        };
        
        return new User(userData);
      }
      
      return null;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Logout the current user
   */
  async logoutUser(): Promise<void> {
    try {
      await AuthService.logout();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Reset user password
   * @param email User email
   */
  async resetUserPassword(email: string): Promise<void> {
    try {
      await AuthService.resetPassword(email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    const firebaseUser = AuthService.getCurrentUser();
    
    if (!firebaseUser) {
      return null;
    }
    
    try {
      const userRef = database.ref(`users/${firebaseUser.uid}`);
      const snapshot = await userRef.once('value');
      
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        // Convert ISO strings to Date objects
        const userData: UserData = {
          ...data,
          createdAt: new Date(data.createdAt),
          updatedAt: new Date(data.updatedAt)
        };
        
        return new User(userData);
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching current user:', error);
      throw error;
    }
  }
}

// Export as a singleton
export default new AuthController();
