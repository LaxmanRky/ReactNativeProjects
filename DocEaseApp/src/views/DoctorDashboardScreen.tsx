import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import AuthController from '../controllers/AuthController';
import { DoctorData } from '../models/User';
import firebase, { database } from '../config/firebase';

interface DoctorDashboardScreenProps {
  navigation: any;
}

interface PatientListItem {
  id: string;
  name: string;
  appointmentDate?: string;
  condition?: string;
}

const DoctorDashboardScreen: React.FC<DoctorDashboardScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [doctorData, setDoctorData] = useState<DoctorData | null>(null);
  const [patients, setPatients] = useState<PatientListItem[]>([]);
  const [todayAppointments, setTodayAppointments] = useState<PatientListItem[]>([]);

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        setLoading(true);
        const user = await AuthController.getCurrentUser();
        
        if (user && user.isDoctor()) {
          // Get doctor data
          const userRef = database.ref(`users/${user.getUserData().uid}`);
          const snapshot = await userRef.once('value');
          
          if (snapshot.exists()) {
            const data = snapshot.val();
            
            // Convert ISO strings to Date objects
            const doctorData: DoctorData = {
              ...data,
              role: 'doctor',
              createdAt: new Date(data.createdAt),
              updatedAt: new Date(data.updatedAt)
            };
            
            setDoctorData(doctorData);
            
            // Fetch doctor's patients
            if (doctorData.patients && doctorData.patients.length > 0) {
              const patientsList: PatientListItem[] = [];
              const todayList: PatientListItem[] = [];
              
              // For demo purposes, we'll create some mock patient data
              // In a real app, you would fetch this from the database
              const mockPatients = [
                { id: '1', name: 'John Smith', appointmentDate: '2025-03-07T14:30:00', condition: 'Flu' },
                { id: '2', name: 'Sarah Johnson', appointmentDate: '2025-03-07T16:00:00', condition: 'Checkup' },
                { id: '3', name: 'Michael Brown', appointmentDate: '2025-03-08T10:15:00', condition: 'Back pain' },
                { id: '4', name: 'Emily Davis', appointmentDate: '2025-03-09T11:30:00', condition: 'Headache' },
                { id: '5', name: 'Robert Wilson', appointmentDate: '2025-03-10T09:00:00', condition: 'Allergies' },
              ];
              
              setPatients(mockPatients);
              
              // Filter today's appointments
              const today = new Date().toISOString().split('T')[0];
              const todayAppointments = mockPatients.filter(
                patient => patient.appointmentDate?.startsWith(today)
              );
              
              setTodayAppointments(todayAppointments);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching doctor data:', error);
        Alert.alert('Error', 'Failed to load doctor data');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorData();
  }, []);

  const handleLogout = async () => {
    try {
      await AuthController.logoutUser();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Logout error:', error);
      Alert.alert('Error', 'Failed to logout');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Doctor Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <Text style={styles.sectionTitle}>Welcome, Dr. {doctorData?.displayName || 'Doctor'}</Text>
          <Text style={styles.profileEmail}>{doctorData?.email}</Text>
          {doctorData?.specialization && (
            <Text style={styles.specialization}>{doctorData.specialization}</Text>
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Today's Appointments</Text>
          {todayAppointments.length > 0 ? (
            todayAppointments.map((appointment, index) => (
              <View key={index} style={styles.appointmentItem}>
                <View>
                  <Text style={styles.appointmentName}>{appointment.name}</Text>
                  <Text style={styles.appointmentCondition}>{appointment.condition}</Text>
                </View>
                <Text style={styles.appointmentTime}>
                  {appointment.appointmentDate ? 
                    new Date(appointment.appointmentDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 
                    'N/A'}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyStateText}>No appointments scheduled for today</Text>
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>My Patients</Text>
          {patients.length > 0 ? (
            patients.map((patient, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.patientItem}
                onPress={() => Alert.alert('View Patient', `View details for ${patient.name}`)}
              >
                <Text style={styles.patientName}>{patient.name}</Text>
                <Text style={styles.patientCondition}>{patient.condition}</Text>
              </TouchableOpacity>
            ))
          ) : (
            <Text style={styles.emptyStateText}>No patients assigned</Text>
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => Alert.alert('Schedule', 'View your schedule')}
            >
              <Text style={styles.quickActionText}>View Schedule</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => Alert.alert('Add Patient', 'Add a new patient')}
            >
              <Text style={styles.quickActionText}>Add Patient</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => Alert.alert('Prescriptions', 'Write a prescription')}
            >
              <Text style={styles.quickActionText}>Write Prescription</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => Alert.alert('Profile', 'Update your profile')}
            >
              <Text style={styles.quickActionText}>Update Profile</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#2980b9',
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  logoutButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  profileEmail: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  specialization: {
    fontSize: 16,
    color: '#2980b9',
    fontWeight: '500',
    marginTop: 5,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  appointmentItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  appointmentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  appointmentCondition: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 3,
  },
  appointmentTime: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2980b9',
  },
  patientItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  patientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
  },
  patientCondition: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 3,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#95a5a6',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 15,
  },
  actionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    backgroundColor: '#f8f9fa',
    width: '48%',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quickActionText: {
    color: '#2c3e50',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default DoctorDashboardScreen;
