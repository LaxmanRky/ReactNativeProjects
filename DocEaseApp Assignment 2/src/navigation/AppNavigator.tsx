import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {HomeScreen} from '../screens/HomeScreen';
import {BookAppointmentScreen} from '../screens/BookAppointmentScreen';
import {RootStackParamList} from '../types/navigation';
import {AppointmentsScreen} from '../screens/AppointmentsScreen';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';

// Main Screens
import DoctorListScreen from '../screens/main/DoctorListScreen';
import DoctorDetailsScreen from '../screens/main/DoctorDetailsScreen';
import ProfileScreen from '../screens/main/ProfileScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route: _route }) => ({
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
        tabBarLabelStyle: {
          fontSize: 12,
        },
      })}>
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Doctors"
        component={DoctorListScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="doctor" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Appointments"
        component={AppointmentsScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="calendar-clock" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({color, size}) => (
            <Icon name="account" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f8f9fa',
          },
          headerTintColor: '#2c3e50',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen 
          name="SignUp" 
          component={SignUpScreen} 
          options={{ headerShown: false }} 
        />
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="DoctorDetails"
          component={DoctorDetailsScreen}
          options={{
            title: 'Doctor Profile',
          }}
        />
        <Stack.Screen
          name="BookAppointment"
          component={BookAppointmentScreen}
          options={{
            title: 'Book Appointment',
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 