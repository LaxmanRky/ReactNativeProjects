import { firestore, auth } from './firebase';

/**
 * Database service for Firebase Firestore operations
 */
export const databaseService = {
  /**
   * Save or update user profile to the database
   */
  saveUserProfile: async (userId: string, data: any) => {
    try {
      await firestore()
        .collection('users')
        .doc(userId)
        .set({
          ...data,
          updatedAt: new Date().toISOString(),
        });
      return true;
    } catch (error) {
      console.error('Error saving user profile:', error);
      throw error;
    }
  },

  /**
   * Get user profile data from the database
   */
  getUserProfile: async (userId: string) => {
    try {
      const docSnap = await firestore()
        .collection('users')
        .doc(userId)
        .get();
        
      if (docSnap.exists) {
        return docSnap.data();
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  },

  /**
   * Get current user profile data from the database
   */
  getCurrentUserProfile: async () => {
    const currentUser = auth().currentUser;
    if (!currentUser) {
      throw new Error('No authenticated user found');
    }
    return databaseService.getUserProfile(currentUser.uid);
  },

  /**
   * Update specific fields in user profile
   */
  updateUserProfile: async (userId: string, updates: any) => {
    try {
      await firestore()
        .collection('users')
        .doc(userId)
        .update({
          ...updates,
          updatedAt: new Date().toISOString(),
        });
      return true;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  /**
   * Listen to user profile changes
   */
  subscribeToUserProfile: (userId: string, callback: (data: any) => void) => {
    const unsubscribe = firestore()
      .collection('users')
      .doc(userId)
      .onSnapshot((docSnap) => {
        if (docSnap.exists) {
          callback(docSnap.data());
        } else {
          callback(null);
        }
      });
    
    return unsubscribe;
  },
  
  /**
   * Save appointment data
   */
  saveAppointment: async (appointmentData: any) => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }
      
      const docRef = appointmentData.id 
        ? firestore().collection('appointments').doc(appointmentData.id)
        : firestore().collection('appointments').doc();
        
      await docRef.set({
        ...appointmentData,
        id: docRef.id,
        userId: currentUser.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      
      return docRef.id;
    } catch (error) {
      console.error('Error saving appointment:', error);
      throw error;
    }
  },
  
  /**
   * Get appointments for current user
   */
  getUserAppointments: async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        throw new Error('No authenticated user found');
      }
      
      const querySnapshot = await firestore()
        .collection('appointments')
        .where('userId', '==', currentUser.uid)
        .get();
      
      const appointments: any[] = [];
      
      querySnapshot.forEach((doc) => {
        appointments.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      
      return appointments;
    } catch (error) {
      console.error('Error getting user appointments:', error);
      throw error;
    }
  }
}; 