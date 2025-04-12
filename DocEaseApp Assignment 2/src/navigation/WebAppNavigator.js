import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../views/LoginScreen';
import RegisterScreen from '../views/RegisterScreen';
import HomeScreen from '../views/HomeScreen';
import authService from '../services/authService';
import { app, auth, isFirebaseInitialized } from '../config/firebase.web';

const Stack = createStackNavigator();

const AuthStack = () => {
  console.log('[WebAppNavigator] Rendering AuthStack');
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
};

const AppStack = () => {
  console.log('[WebAppNavigator] Rendering AppStack');
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }} 
      />
    </Stack.Navigator>
  );
};

const ErrorScreen = ({ error, onRetry }) => {
  console.error('[WebAppNavigator] Rendering ErrorScreen with error:', error);
  return (
    <View style={styles.container}>
      <Text style={styles.errorTitle}>Error Initializing App</Text>
      <Text style={styles.errorText}>{error}</Text>
      <Text style={styles.errorHint}>Please check the console for more details.</Text>
      <Text style={styles.errorHint}>Try refreshing the page or clearing your browser cache.</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const WebAppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);
  const [initAttempts, setInitAttempts] = useState(0);

  const checkAuthStatus = () => {
    try {
      console.log('[WebAppNavigator] Checking authentication status...');
      console.log('[WebAppNavigator] Firebase app initialized:', app ? 'Yes' : 'No');
      console.log('[WebAppNavigator] Firebase auth initialized:', auth ? 'Yes' : 'No');
      console.log('[WebAppNavigator] Firebase fully initialized:', isFirebaseInitialized() ? 'Yes' : 'No');
      
      const isAuth = authService.isAuthenticated();
      console.log('[WebAppNavigator] User is authenticated:', isAuth);
      
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('action') === 'logout') {
        console.log('[WebAppNavigator] Logout action detected in URL');
        window.history.replaceState({}, document.title, window.location.pathname);
        if (isAuth) {
          console.log('[WebAppNavigator] Forcing logout');
          authService.logout().then(() => {
            setIsAuthenticated(false);
            setIsLoading(false);
          }).catch(err => {
            console.error('[WebAppNavigator] Error during forced logout:', err);
            setIsAuthenticated(false);
            setIsLoading(false);
          });
          return;
        }
      }
      
      setIsAuthenticated(isAuth);
      setIsLoading(false);
      setError(null);
    } catch (err) {
      console.error('[WebAppNavigator] Error checking auth status:', err);
      
      if (initAttempts < 5) {
        console.log(`[WebAppNavigator] Retrying (${initAttempts + 1}/5)...`);
        setInitAttempts(prev => prev + 1);
        
        setTimeout(checkAuthStatus, 1500 * (initAttempts + 1));
      } else {
        setError(err.message || 'Failed to initialize Firebase');
        setIsLoading(false);
      }
    }
  };

  const handleRetry = () => {
    console.log('[WebAppNavigator] Retry requested, resetting state and trying again');
    setIsLoading(true);
    setError(null);
    setInitAttempts(0);
    
    setTimeout(checkAuthStatus, 1000);
  };

  useEffect(() => {
    console.log('[WebAppNavigator] Component mounted, initializing...');
    
    const initTimeout = setTimeout(() => {
      console.log('[WebAppNavigator] Initialization timeout completed, checking auth...');
      checkAuthStatus();
    }, 2000);

    return () => {
      clearTimeout(initTimeout);
      console.log('[WebAppNavigator] Component unmounted, cleanup complete');
    };
  }, [initAttempts]);

  if (isLoading) {
    console.log('[WebAppNavigator] Rendering loading screen');
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Initializing DocEase...</Text>
      </View>
    );
  }

  if (error) {
    return <ErrorScreen error={error} onRetry={handleRetry} />;
  }

  console.log('[WebAppNavigator] Rendering NavigationContainer, isAuthenticated:', isAuthenticated);
  
  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  errorHint: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  retryButton: {
    backgroundColor: '#3498db',
    borderRadius: 5,
    padding: 10,
    marginHorizontal: 5,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});

export default WebAppNavigator;
