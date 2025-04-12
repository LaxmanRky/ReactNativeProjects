import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Import screens
import LoginScreen from '../views/LoginScreen';
import RegisterScreen from '../views/RegisterScreen';
import HomeScreen from '../views/HomeScreen';
import ProfileScreen from '../views/ProfileScreen';

// Import auth controller
import authController from '../controllers/AuthController';

const Stack = createStackNavigator();

const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

const AppStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ 
          title: 'Edit Profile',
          headerStyle: {
            backgroundColor: '#3498db',
          },
          headerTintColor: '#fff',
        }}
      />
    </Stack.Navigator>
  );
};

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const auth = authController.isUserAuthenticated();
      setIsAuthenticated(auth);
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppNavigator;
