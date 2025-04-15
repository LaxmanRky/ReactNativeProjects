import React from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {
  Text,
  Button,
  Surface,
  Avatar,
} from 'react-native-paper';
import CardComponent from '../../components/CardComponent';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const upcomingAppointments = [
    {
      id: '1',
      doctorName: 'Dr. Sarah Johnson',
      specialty: 'Cardiologist',
      date: '2024-03-20',
      time: '10:00 AM',
    },
    {
      id: '2',
      doctorName: 'Dr. Michael Chen',
      specialty: 'Dermatologist',
      date: '2024-03-22',
      time: '2:30 PM',
    },
  ];

  const handleBookAppointment = () => {
    navigation.navigate('BookAppointment');
  };

  const handleFindDoctor = () => {
    navigation.navigate('DoctorList');
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <Text variant="headlineMedium" style={styles.welcomeText}>
          Welcome Back!
        </Text>
      </Surface>

      <View style={styles.quickActions}>
        <CardComponent style={styles.actionCard}>
          <Text variant="titleMedium">Book Appointment</Text>
          <View style={styles.buttonContainer}>
            <Button mode="contained" onPress={handleBookAppointment}>
              Book Now
            </Button>
          </View>
        </CardComponent>

        <CardComponent style={styles.actionCard}>
          <Text variant="titleMedium">Find Doctor</Text>
          <View style={styles.buttonContainer}>
            <Button mode="contained" onPress={handleFindDoctor}>
              Search
            </Button>
          </View>
        </CardComponent>
      </View>

      <Surface style={styles.appointmentsSection} elevation={1}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Upcoming Appointments
        </Text>
        {upcomingAppointments.map(appointment => (
          <CardComponent key={appointment.id} style={styles.appointmentCard}>
            <View style={styles.appointmentHeader}>
              <Avatar.Icon size={40} icon="doctor" />
              <View style={styles.appointmentInfo}>
                <Text variant="titleMedium">{appointment.doctorName}</Text>
                <Text variant="bodyMedium">{appointment.specialty}</Text>
              </View>
            </View>
            <View style={styles.appointmentDetails}>
              <Text variant="bodyMedium">Date: {appointment.date}</Text>
              <Text variant="bodyMedium">Time: {appointment.time}</Text>
            </View>
            <View style={styles.buttonRow}>
              <Button mode="outlined" onPress={() => {}}>
                Reschedule
              </Button>
              <Button mode="contained" onPress={() => {}}>
                View Details
              </Button>
            </View>
          </CardComponent>
        ))}
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#ffffff',
  },
  welcomeText: {
    textAlign: 'left',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },
  actionCard: {
    flex: 1,
    margin: 4,
  },
  buttonContainer: {
    marginTop: 12,
  },
  appointmentsSection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  appointmentCard: {
    marginBottom: 16,
  },
  appointmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentInfo: {
    marginLeft: 12,
    flex: 1,
  },
  appointmentDetails: {
    marginTop: 8,
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
});

export default HomeScreen; 