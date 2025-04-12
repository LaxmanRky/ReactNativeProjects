// Web-specific implementation of Auth Service
import { 
  getAuth, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth';

class WebAuthService {
  constructor() {
    this.auth = null;
    // Initialize auth when the module is imported
    this.initAuth();
  }

  async initAuth() {
    try {
      this.auth = getAuth();
      console.log('Web Auth Service initialized');
    } catch (error) {
      console.error('Web Auth Service initialization error:', error);
    }
  }

  // Register a new user
  async register(email, password) {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Registration error:', error.message);
      throw error;
    }
  }

  // Login an existing user
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error.message);
      throw error;
    }
  }

  // Logout the current user
  async logout() {
    try {
      await signOut(this.auth);
      return true;
    } catch (error) {
      console.error('Logout error:', error.message);
      throw error;
    }
  }

  // Get the current authenticated user
  getCurrentUser() {
    return this.auth?.currentUser;
  }

  // Check if a user is authenticated
  isAuthenticated() {
    return this.auth?.currentUser !== null;
  }

  // Reset password for a user
  async resetPassword(email) {
    try {
      await sendPasswordResetEmail(this.auth, email);
      return true;
    } catch (error) {
      console.error('Reset password error:', error.message);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(displayName) {
    try {
      const user = this.getCurrentUser();
      if (user) {
        await updateProfile(user, { displayName });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Update profile error:', error.message);
      throw error;
    }
  }
}

// Create a singleton instance
const webAuthService = new WebAuthService();
export default webAuthService;
