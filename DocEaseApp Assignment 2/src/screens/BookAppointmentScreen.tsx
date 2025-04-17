import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NavigationProp, RootStackParamList } from '../types/navigation';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

type BookAppointmentRouteProp = RouteProp<RootStackParamList, 'BookAppointment'>;

export const BookAppointmentScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<BookAppointmentRouteProp>();
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    reason: '',
    timeSlot: '12:00 PM',
  });

  // Check if route.params exists and has doctor data
  if (!route.params?.doctor) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: Doctor information not found</Text>
      </View>
    );
  }

  const { doctor } = route.params;

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    try {
      const appointmentData = {
        doctorId: doctor.id,
        doctorName: doctor.name,
        department: doctor.department,
        appointmentDate: format(date, 'yyyy-MM-dd'),
        timeSlot: formData.timeSlot,
        reason: formData.reason,
        createdAt: Date.now(),
        status: 'pending',
        online: true,
      };

      // Add your Firebase call here
      // await addDoc(collection(db, 'appointments'), appointmentData);
      console.log('Appointment data:', appointmentData);

      navigation.goBack();
    } catch (error) {
      console.error('Error booking appointment:', error);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Book Appointment</Text>
        <Text style={styles.subtitle}>with {doctor.name}</Text>
        <Text style={styles.department}>{doctor.department}</Text>
      </View>

      <View style={styles.form}>
        <Button
          mode="outlined"
          onPress={() => setShowDatePicker(true)}
          style={styles.input}
        >
          {format(date, 'MMMM dd, yyyy')}
        </Button>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )}

        <TextInput
          label="Time Slot"
          value={formData.timeSlot}
          onChangeText={(text) => setFormData({ ...formData, timeSlot: text })}
          style={styles.input}
          mode="outlined"
        />

        <TextInput
          label="Reason for Visit"
          value={formData.reason}
          onChangeText={(text) => setFormData({ ...formData, reason: text })}
          style={styles.input}
          mode="outlined"
          multiline
          numberOfLines={4}
        />

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={[styles.button, styles.cancelButton]}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={[styles.button, styles.submitButton]}
          >
            Book Appointment
          </Button>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 18,
    color: '#34495e',
    marginTop: 5,
  },
  department: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 5,
  },
  form: {
    padding: 20,
    gap: 15,
  },
  input: {
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 20,
  },
  button: {
    flex: 1,
    paddingVertical: 8,
  },
  submitButton: {
    backgroundColor: '#2ecc71',
  },
  cancelButton: {
    backgroundColor: '#e74c3c',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    padding: 20,
  },
}); 