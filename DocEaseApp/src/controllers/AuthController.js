import { Platform } from 'react-native';
import authService from '../services/authService';
import User from '../models/User';
import { ref, set, get } from 'firebase/database';
import { app, database, isFirebaseInitialized } from '../config/firebase.web';

class AuthController {
  async registerUser(email, password, displayName) {
    try {
      console.log('AuthController: Registering user with email:', email);
      
      const firebaseUser = await authService.register(email, password);
      
      if (!firebaseUser) {
        console.error('AuthController: Registration failed - no user returned');
        throw new Error('Registration failed');
      }
      
      console.log('AuthController: User registered successfully with Firebase Auth');
      
      const user = User.fromFirebaseUser(firebaseUser);
      
      if (displayName) {
        console.log('AuthController: Updating user profile with display name:', displayName);
        await authService.updateProfile(displayName);
        user.displayName = displayName;
      }
      
      if (Platform.OS === 'web') {
        try {
          if (!isFirebaseInitialized()) {
            console.warn('AuthController: Firebase not fully initialized, waiting...');
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            if (!isFirebaseInitialized()) {
              console.warn('AuthController: Firebase still not initialized, skipping database operations');
              return user;
            }
          }
          
          console.log('AuthController: Storing user data in Realtime Database');
          const userRef = ref(database, 'registeruser/' + firebaseUser.uid);
          
          const userData = {
            email: email,
            displayName: displayName || '',
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            uid: firebaseUser.uid
          };
          
          await set(userRef, userData);
          console.log('AuthController: User data stored in Realtime Database');
          
          try {
            const snapshot = await get(userRef);
            if (snapshot.exists()) {
              console.log('AuthController: Verified user data was stored successfully');
            } else {
              console.warn('AuthController: User data not found after storage attempt');
            }
          } catch (verifyError) {
            console.error('AuthController: Error verifying user data:', verifyError);
          }
        } catch (dbError) {
          console.error('AuthController: Error storing user data in database:', dbError);
        }
      }
      
      return user;
    } catch (error) {
      console.error('AuthController: Registration error:', error);
      throw error;
    }
  }

  async loginUser(email, password) {
    try {
      console.log('AuthController: Logging in user with email:', email);
      
      const firebaseUser = await authService.login(email, password);
      
      if (!firebaseUser) {
        console.error('AuthController: Login failed - no user returned');
        throw new Error('Login failed');
      }
      
      console.log('AuthController: User logged in successfully');
      
      if (Platform.OS === 'web') {
        try {
          if (!isFirebaseInitialized()) {
            console.warn('AuthController: Firebase not fully initialized, skipping last login update');
          } else {
            console.log('AuthController: Updating last login time in database');
            const userRef = ref(database, 'registeruser/' + firebaseUser.uid + '/lastLogin');
            
            await set(userRef, new Date().toISOString());
            console.log('AuthController: Last login time updated in database');
          }
        } catch (dbError) {
          console.error('AuthController: Error updating last login time:', dbError);
        }
      }
      
      return User.fromFirebaseUser(firebaseUser);
    } catch (error) {
      console.error('AuthController: Login error:', error);
      throw error;
    }
  }

  async logoutUser() {
    try {
      console.log('AuthController: Logging out user');
      await authService.logout();
      console.log('AuthController: User logged out successfully');
      return true;
    } catch (error) {
      console.error('AuthController: Logout error:', error);
      throw error;
    }
  }

  async resetPassword(email) {
    try {
      console.log('AuthController: Resetting password for email:', email);
      await authService.resetPassword(email);
      console.log('AuthController: Password reset email sent successfully');
      return true;
    } catch (error) {
      console.error('AuthController: Reset password error:', error);
      throw error;
    }
  }

  isUserAuthenticated() {
    try {
      const isAuth = authService.isAuthenticated();
      console.log('AuthController: User is authenticated:', isAuth);
      return isAuth;
    } catch (error) {
      console.error('AuthController: Authentication check error:', error);
      return false;
    }
  }

  getCurrentUser() {
    try {
      const firebaseUser = authService.getCurrentUser();
      console.log('AuthController: Getting current user:', firebaseUser ? 'Found' : 'Not found');
      
      if (!firebaseUser) {
        return null;
      }
      
      return User.fromFirebaseUser(firebaseUser);
    } catch (error) {
      console.error('AuthController: Get current user error:', error);
      return null;
    }
  }
}

export default new AuthController();
