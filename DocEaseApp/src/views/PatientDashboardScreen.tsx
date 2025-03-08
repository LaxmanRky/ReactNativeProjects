import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import AuthController from '../controllers/AuthController';
import Patient from '../models/Patient';
import { PatientData } from '../models/User';

interface PatientDashboardScreenProps {
  navigation: any;
}

const PatientDashboardScreen: React.FC<PatientDashboardScreenProps> = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<string[]>([]);
  const [medicalHistory, setMedicalHistory] = useState<string[]>([]);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setLoading(true);
        const user = await AuthController.getCurrentUser();
        
        if (user && user.isPatient()) {
          const patient = await Patient.getPatientById(user.getUserData().uid);
          if (patient) {
            setPatientData(patient.getPatientData());
            setUpcomingAppointments(patient.getPatientData().appointments || []);
            setMedicalHistory(patient.getPatientData().medicalHistory || []);
          }
        }
      } catch (error) {
        console.error('Error fetching patient data:', error);
        Alert.alert('Error', 'Failed to load patient data');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
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
        <Text style={styles.headerTitle}>Patient Dashboard</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.profileSection}>
          <Text style={styles.sectionTitle}>Welcome, {patientData?.displayName || 'Patient'}</Text>
          <Text style={styles.profileEmail}>{patientData?.email}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Upcoming Appointments</Text>
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map((appointment, index) => (
              <View key={index} style={styles.appointmentItem}>
                <Text style={styles.appointmentText}>{appointment}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyStateText}>No upcoming appointments</Text>
          )}
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Book Appointment</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Medical History</Text>
          {medicalHistory.length > 0 ? (
            medicalHistory.map((record, index) => (
              <View key={index} style={styles.medicalRecordItem}>
                <Text style={styles.medicalRecordText}>{record}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyStateText}>No medical history records</Text>
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Quick Actions</Text>
          <View style={styles.actionsContainer}>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionText}>View Prescriptions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
              <Text style={styles.quickActionText}>Message Doctor</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickActionButton}>
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
    backgroundColor: '#3498db',
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
  },
  appointmentText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  medicalRecordItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  medicalRecordText: {
    fontSize: 16,
    color: '#2c3e50',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#95a5a6',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 15,
  },
  actionButton: {
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
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

export default PatientDashboardScreen;
