import firebase from '../../config/firebase';

/**
 * AuthService class - Handles all authentication related operations
 * Implements the Service layer in the MVC pattern
 */
class AuthService {
  /**
   * Register a new user with email and password
   * @param email User email
   * @param password User password
   * @returns Promise with user credential
   */
  async register(email: string, password: string): Promise<any> {
    try {
      return await firebase.auth().createUserWithEmailAndPassword(email, password);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Login a user with email and password
   * @param email User email
   * @param password User password
   * @returns Promise with user credential
   */
  async login(email: string, password: string): Promise<any> {
    try {
      return await firebase.auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout the current user
   * @returns Promise<void>
   */
  async logout(): Promise<void> {
    try {
      return await firebase.auth().signOut();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Send password reset email
   * @param email User email
   * @returns Promise<void>
   */
  async resetPassword(email: string): Promise<void> {
    try {
      return await firebase.auth().sendPasswordResetEmail(email);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get the current authenticated user
   * @returns User | null
   */
  getCurrentUser(): any | null {
    return firebase.auth().currentUser;
  }
}

// Export as a singleton
export default new AuthService();
