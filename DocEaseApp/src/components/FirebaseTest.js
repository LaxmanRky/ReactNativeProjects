import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { Platform } from 'react-native';
import firebaseConfig from '../config/firebase.web';

const FirebaseTest = () => {
  const [status, setStatus] = useState('Testing Firebase...');
  const [error, setError] = useState(null);
  const [firebaseApp, setFirebaseApp] = useState(null);

  useEffect(() => {
    const testFirebase = async () => {
      try {
        setStatus('Importing Firebase modules...');
        
        // Import Firebase modules
        const firebaseApp = await import('firebase/app');
        const firebaseAuth = await import('firebase/auth');
        
        setStatus('Firebase modules imported successfully');
        
        setStatus('Initializing Firebase with config...');
        console.log('Firebase config:', firebaseConfig);
        
        // Initialize Firebase
        const { initializeApp } = firebaseApp;
        const app = initializeApp(firebaseConfig);
        setFirebaseApp(app);
        
        setStatus('Firebase initialized successfully');
        console.log('Firebase app:', app);
        
        // Get auth
        const { getAuth } = firebaseAuth;
        const auth = getAuth(app);
        
        setStatus('Firebase Auth initialized');
        console.log('Firebase auth:', auth ? 'Valid auth object' : 'Invalid auth object');
        
      } catch (error) {
        console.error('Firebase test error:', error);
        setStatus('Firebase initialization failed');
        setError(error.message || 'Unknown error');
      }
    };
    
    if (Platform.OS === 'web') {
      testFirebase();
    } else {
      setStatus('Not running on web platform');
    }
  }, []);
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Test</Text>
      <Text style={styles.status}>{status}</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      {firebaseApp && <Text style={styles.success}>Firebase is working!</Text>}
      <View style={styles.buttonContainer}>
        <Button 
          title="Reload Test" 
          onPress={() => window.location.reload()} 
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#3498db',
  },
  status: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  error: {
    fontSize: 16,
    marginTop: 10,
    padding: 10,
    backgroundColor: '#ffebee',
    borderRadius: 5,
    color: '#e53935',
    maxWidth: 400,
    width: '100%',
    textAlign: 'center',
  },
  success: {
    fontSize: 16,
    marginTop: 10,
    padding: 10,
    backgroundColor: '#e8f5e9',
    borderRadius: 5,
    color: '#43a047',
    maxWidth: 400,
    width: '100%',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 20,
    width: '80%',
    maxWidth: 300,
  },
});

export default FirebaseTest;
