import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, Platform } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { firebaseConfig } from './src/config/firebase';
import firebase from '@react-native-firebase/app';

// Initialize Firebase if it hasn't been initialized yet
const initializeFirebase = async () => {
  try {
    if (!firebase.apps.length) {
      await firebase.initializeApp(firebaseConfig);
      console.log('Firebase initialized successfully');
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
};

const App = () => {
  useEffect(() => {
    // Initialize Firebase when the app starts
    initializeFirebase();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <AppNavigator />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
});

export default App;
