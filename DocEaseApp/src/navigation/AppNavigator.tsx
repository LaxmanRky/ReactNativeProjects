import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../views/LoginScreen';
import RegisterScreen from '../views/RegisterScreen';
import PatientDashboardScreen from '../views/PatientDashboardScreen';
import DoctorDashboardScreen from '../views/DoctorDashboardScreen';
import SplashScreen from '../views/SplashScreen';
import AuthController from '../controllers/AuthController';
import User from '../models/User';

// Define the types for our stack navigator
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  PatientDashboard: undefined;
  DoctorDashboard: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthState = async () => {
      try {
        const currentUser = await AuthController.getCurrentUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Auth state check error:', error);
      } finally {
        setInitializing(false);
      }
    };

    checkAuthState();
  }, []);

  if (initializing) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator 
        screenOptions={{
          headerShown: false,
        }}
      >
        {user ? (
          // User is signed in
          user.isPatient() ? (
            // Patient routes
            <Stack.Screen name="PatientDashboard" component={PatientDashboardScreen} />
          ) : (
            // Doctor routes
            <Stack.Screen name="DoctorDashboard" component={DoctorDashboardScreen} />
          )
        ) : (
          // User is not signed in
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
