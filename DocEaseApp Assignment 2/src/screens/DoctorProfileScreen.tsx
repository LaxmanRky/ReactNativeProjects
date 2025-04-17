import React, { useState } from 'react';
import { View, StyleSheet, Modal, Alert } from 'react-native';
import { DoctorProfile } from '../components/DoctorProfile';
import { AppointmentForm } from '../components/AppointmentForm';
import { Doctor, TimeSlot } from '../types/doctor';

// Mock data for demonstration
const mockDoctor: Doctor = {
  id: '1',
  name: 'John Smith',
  specialization: 'Cardiologist',
  experience: 15,
  education: 'MBBS, MD - Cardiology',
  image: 'https://example.com/doctor-image.jpg',
  availability: {
    '2024-03-20': [
      { startTime: '09:00', endTime: '10:00', isAvailable: true },
      { startTime: '10:00', endTime: '11:00', isAvailable: true },
      { startTime: '11:00', endTime: '12:00', isAvailable: false },
      { startTime: '14:00', endTime: '15:00', isAvailable: true },
    ],
  },
};

export const DoctorProfileScreen: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);

  const handleBookAppointment = (date: string, timeSlot: TimeSlot) => {
    setSelectedDate(date);
    setSelectedTimeSlot(timeSlot);
    setShowAppointmentForm(true);
  };

  const handleAppointmentSubmit = (formData: {
    patientName: string;
    patientEmail: string;
    phoneNumber: string;
  }) => {
    // Here you would typically make an API call to save the appointment
    console.log('Appointment booked:', {
      doctorId: mockDoctor.id,
      date: selectedDate,
      timeSlot: selectedTimeSlot,
      ...formData,
    });

    Alert.alert(
      'Success',
      'Your appointment has been booked successfully!',
      [{ text: 'OK', onPress: () => setShowAppointmentForm(false) }]
    );
  };

  return (
    <View style={styles.container}>
      <DoctorProfile
        doctor={mockDoctor}
        onBookAppointment={handleBookAppointment}
      />

      <Modal
        visible={showAppointmentForm}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          {selectedTimeSlot && (
            <AppointmentForm
              doctorId={mockDoctor.id}
              selectedDate={selectedDate}
              selectedTimeSlot={selectedTimeSlot}
              onSubmit={handleAppointmentSubmit}
              onCancel={() => setShowAppointmentForm(false)}
            />
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
}); 