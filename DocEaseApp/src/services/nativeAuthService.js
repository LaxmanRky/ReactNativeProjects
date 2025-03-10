// Native-specific implementation of Auth Service
import auth from '@react-native-firebase/auth';

class NativeAuthService {
  // Register a new user
  async register(email, password) {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Registration error:', error.message);
      throw error;
    }
  }

  // Login an existing user
  async login(email, password) {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      return userCredential.user;
    } catch (error) {
      console.error('Login error:', error.message);
      throw error;
    }
  }

  // Logout the current user
  async logout() {
    try {
      await auth().signOut();
      return true;
    } catch (error) {
      console.error('Logout error:', error.message);
      throw error;
    }
  }

  // Get the current authenticated user
  getCurrentUser() {
    return auth().currentUser;
  }

  // Check if a user is authenticated
  isAuthenticated() {
    return auth().currentUser !== null;
  }

  // Reset password for a user
  async resetPassword(email) {
    try {
      await auth().sendPasswordResetEmail(email);
      return true;
    } catch (error) {
      console.error('Reset password error:', error.message);
      throw error;
    }
  }

  // Update user profile
  async updateProfile(displayName) {
    try {
      const user = auth().currentUser;
      if (user) {
        await user.updateProfile({ displayName });
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
const nativeAuthService = new NativeAuthService();
export default nativeAuthService;
