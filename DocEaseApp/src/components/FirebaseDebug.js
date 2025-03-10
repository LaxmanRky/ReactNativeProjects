import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Button, ActivityIndicator } from 'react-native';
import { Platform } from 'react-native';
import { app, auth, database, isFirebaseInitialized, getInitializationError } from '../config/firebase.web';

const FirebaseDebug = () => {
  const [logs, setLogs] = useState([]);
  const [firebaseStatus, setFirebaseStatus] = useState({
    app: 'Checking...',
    auth: 'Checking...',
    database: 'Checking...',
    initialized: 'Checking...'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const addLog = (message) => {
    const timestamp = new Date().toISOString();
    setLogs(prev => [...prev, { timestamp, message }]);
  };

  const checkFirebaseStatus = () => {
    try {
      addLog('Checking Firebase status...');
      
      const status = {
        app: app ? 'Initialized' : 'Not initialized',
        auth: auth ? 'Initialized' : 'Not initialized',
        database: database ? 'Initialized' : 'Not initialized',
        initialized: isFirebaseInitialized() ? 'Yes' : 'No'
      };
      
      setFirebaseStatus(status);
      addLog(`Firebase status: ${JSON.stringify(status)}`);
      
      const initError = getInitializationError();
      if (initError) {
        setError(initError.message || 'Unknown initialization error');
        addLog(`Firebase initialization error: ${initError.message}`);
      } else {
        setError(null);
      }
      
      setLoading(false);
    } catch (err) {
      addLog(`Error checking Firebase status: ${err.message}`);
      setError(err.message);
      setLoading(false);
    }
  };

  const retryInitialization = () => {
    setLoading(true);
    setError(null);
    
    // Wait a moment and check again
    setTimeout(() => {
      checkFirebaseStatus();
    }, 2000);
  };

  useEffect(() => {
    // Capture console logs
    const originalConsoleLog = console.log;
    const originalConsoleError = console.error;

    console.log = function() {
      const args = Array.from(arguments);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      addLog(`LOG: ${message}`);
      originalConsoleLog.apply(console, arguments);
    };

    console.error = function() {
      const args = Array.from(arguments);
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
      ).join(' ');
      
      addLog(`ERROR: ${message}`);
      originalConsoleError.apply(console, arguments);
    };

    // Check Firebase status after a delay to allow initialization
    setTimeout(() => {
      checkFirebaseStatus();
    }, 3000);

    // Restore console functions when component unmounts
    return () => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
    };
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Debug Panel</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Checking Firebase status...</Text>
        </View>
      ) : (
        <>
          <View style={styles.statusContainer}>
            <Text style={styles.sectionTitle}>Firebase Status:</Text>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Firebase App:</Text>
              <Text style={[
                styles.statusValue, 
                firebaseStatus.app === 'Initialized' ? styles.statusSuccess : styles.statusError
              ]}>
                {firebaseStatus.app}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Firebase Auth:</Text>
              <Text style={[
                styles.statusValue, 
                firebaseStatus.auth === 'Initialized' ? styles.statusSuccess : styles.statusError
              ]}>
                {firebaseStatus.auth}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Firebase Database:</Text>
              <Text style={[
                styles.statusValue, 
                firebaseStatus.database === 'Initialized' ? styles.statusSuccess : styles.statusError
              ]}>
                {firebaseStatus.database}
              </Text>
            </View>
            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Fully Initialized:</Text>
              <Text style={[
                styles.statusValue, 
                firebaseStatus.initialized === 'Yes' ? styles.statusSuccess : styles.statusError
              ]}>
                {firebaseStatus.initialized}
              </Text>
            </View>
          </View>
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorTitle}>Error:</Text>
              <Text style={styles.errorText}>{error}</Text>
              <Button 
                title="Retry Initialization" 
                onPress={retryInitialization} 
                color="#3498db"
              />
            </View>
          )}
          
          <Text style={styles.sectionTitle}>Console Logs:</Text>
          <ScrollView style={styles.logContainer}>
            {logs.map((log, index) => (
              <Text key={index} style={styles.logText}>
                <Text style={styles.logTimestamp}>{log.timestamp.substring(11, 19)}</Text>
                <Text>{log.message}</Text>
              </Text>
            ))}
          </ScrollView>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2c3e50',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 10,
    color: '#2c3e50',
  },
  statusContainer: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  statusLabel: {
    fontSize: 16,
    color: '#2c3e50',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusSuccess: {
    color: '#27ae60',
  },
  statusError: {
    color: '#e74c3c',
  },
  errorContainer: {
    backgroundColor: '#ffecec',
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#f5c6cb',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#721c24',
    marginBottom: 5,
  },
  errorText: {
    fontSize: 14,
    color: '#721c24',
    marginBottom: 10,
  },
  logContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  logText: {
    fontSize: 12,
    fontFamily: Platform.OS === 'web' ? 'monospace' : 'courier',
    marginBottom: 5,
  },
  logTimestamp: {
    color: '#7f8c8d',
    marginRight: 10,
  },
});

export default FirebaseDebug;
