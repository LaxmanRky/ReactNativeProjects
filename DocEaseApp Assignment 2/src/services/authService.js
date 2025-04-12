import { Platform } from 'react-native';
import { auth, isFirebaseInitialized, initializeFirebaseAsync } from '../config/firebase.web';

let authService;

if (Platform.OS === 'web') {
  console.log('Initializing Web Auth Service');
  authService = {
    register: async (email, password) => {
      try {
        console.log('Checking Firebase initialization before registration');
        if (!isFirebaseInitialized()) {
          console.log('Firebase not initialized, waiting for initialization...');
          await initializeFirebaseAsync();
        }
        
        console.log('Firebase initialized, proceeding with registration');
        const firebaseAuth = await import('firebase/auth');
        const { createUserWithEmailAndPassword } = firebaseAuth;
        
        console.log('Registering user with email:', email);
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log('User registered successfully:', userCredential.user);
        return userCredential.user;
      } catch (error) {
        console.error('Registration error:', error);
        throw error;
      }
    },
    
    login: async (email, password) => {
      try {
        console.log('Checking Firebase initialization before login');
        if (!isFirebaseInitialized()) {
          console.log('Firebase not initialized, waiting for initialization...');
          await initializeFirebaseAsync();
        }
        
        console.log('Firebase initialized, proceeding with login');
        const firebaseAuth = await import('firebase/auth');
        const { signInWithEmailAndPassword } = firebaseAuth;
        
        console.log('Logging in user with email:', email);
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log('User logged in successfully:', userCredential.user);
        return userCredential.user;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    
    logout: async () => {
      try {
        console.log('Checking Firebase initialization before logout');
        if (!isFirebaseInitialized()) {
          console.log('Firebase not initialized, waiting for initialization...');
          await initializeFirebaseAsync();
        }
        
        console.log('Firebase initialized, proceeding with logout');
        const firebaseAuth = await import('firebase/auth');
        const { signOut } = firebaseAuth;
        
        console.log('Logging out user');
        await signOut(auth);
        
        if (typeof localStorage !== 'undefined') {
          localStorage.removeItem('user');
          localStorage.removeItem('userToken');
        }
        
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem('user');
          sessionStorage.removeItem('userToken');
        }
        
        console.log('User logged out successfully');
        return true;
      } catch (error) {
        console.error('Logout error:', error);
        throw error;
      }
    },
    
    getCurrentUser: () => {
      try {
        if (!auth) {
          console.error('Auth not initialized');
          return null;
        }
        
        const user = auth.currentUser;
        console.log('Current user:', user ? 'Authenticated' : 'Not authenticated');
        return user;
      } catch (error) {
        console.error('Get current user error:', error);
        return null;
      }
    },
    
    isAuthenticated: () => {
      try {
        if (!auth) {
          console.error('Auth not initialized');
          return false;
        }
        
        const isAuth = !!auth.currentUser;
        console.log('Is authenticated:', isAuth);
        return isAuth;
      } catch (error) {
        console.error('Is authenticated error:', error);
        return false;
      }
    },
    
    resetPassword: async (email) => {
      try {
        console.log('Checking Firebase initialization before password reset');
        if (!isFirebaseInitialized()) {
          console.log('Firebase not initialized, waiting for initialization...');
          await initializeFirebaseAsync();
        }
        
        console.log('Firebase initialized, proceeding with password reset');
        const firebaseAuth = await import('firebase/auth');
        const { sendPasswordResetEmail } = firebaseAuth;
        
        console.log('Sending password reset email to:', email);
        await sendPasswordResetEmail(auth, email);
        console.log('Password reset email sent successfully');
        return true;
      } catch (error) {
        console.error('Reset password error:', error);
        throw error;
      }
    },
    
    updateProfile: async (displayName) => {
      try {
        console.log('Checking Firebase initialization before profile update');
        if (!isFirebaseInitialized()) {
          console.log('Firebase not initialized, waiting for initialization...');
          await initializeFirebaseAsync();
        }
        
        console.log('Firebase initialized, proceeding with profile update');
        const firebaseAuth = await import('firebase/auth');
        const { updateProfile } = firebaseAuth;
        
        const user = auth.currentUser;
        if (!user) {
          throw new Error('No authenticated user found');
        }
        
        console.log('Updating profile for user:', user.uid);
        await updateProfile(user, { displayName });
        console.log('Profile updated successfully');
        return true;
      } catch (error) {
        console.error('Update profile error:', error);
        throw error;
      }
    }
  };
} else {
  try {
    authService = {
      register: async (email, password) => {
        try {
          console.log('Registering user with email:', email);
          throw new Error('Not implemented for this platform');
        } catch (error) {
          console.error('Registration error:', error);
          throw error;
        }
      },
      
      login: async (email, password) => {
        try {
          console.log('Logging in user with email:', email);
          throw new Error('Not implemented for this platform');
        } catch (error) {
          console.error('Login error:', error);
          throw error;
        }
      },
      
      logout: async () => {
        try {
          console.log('Logging out user');
          throw new Error('Not implemented for this platform');
        } catch (error) {
          console.error('Logout error:', error);
          throw error;
        }
      },
      
      getCurrentUser: () => null,
      
      isAuthenticated: () => false,
      
      resetPassword: async (email) => {
        try {
          console.log('Sending password reset email to:', email);
          throw new Error('Not implemented for this platform');
        } catch (error) {
          console.error('Reset password error:', error);
          throw error;
        }
      },
      
      updateProfile: async (displayName) => {
        try {
          console.log('Updating profile');
          throw new Error('Not implemented for this platform');
        } catch (error) {
          console.error('Update profile error:', error);
          throw error;
        }
      }
    };
  } catch (error) {
    console.error('Failed to initialize Auth Service:', error);
  }
}

export default authService;
