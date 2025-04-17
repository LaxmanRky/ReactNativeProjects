import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';

interface AppointmentFormProps {
  doctorName: string;
  department: string;
  onSubmit: (formData: {
    reason: string;
    appointmentDate: string;
    timeSlot: string;
  }) => void;
  onCancel: () => void;
}

export const AppointmentForm: React.FC<AppointmentFormProps> = ({
  doctorName,
  department,
  onSubmit,
  onCancel,
}) => {
  const [formData, setFormData] = useState({
    reason: '',
    appointmentDate: '',
    timeSlot: '',
  });

  const handleSubmit = () => {
    if (!formData.reason || !formData.appointmentDate || !formData.timeSlot) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    onSubmit(formData);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Book Appointment</Text>
      
      <View style={styles.appointmentInfo}>
        <Text style={styles.infoText}>Doctor: {doctorName}</Text>
        <Text style={styles.infoText}>Department: {department}</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Appointment Date (YYYY-MM-DD)"
          value={formData.appointmentDate}
          onChangeText={(text) => setFormData({ ...formData, appointmentDate: text })}
        />
        
        <TextInput
          style={styles.input}
          placeholder="Preferred Time (e.g. 12:00 PM)"
          value={formData.timeSlot}
          onChangeText={(text) => setFormData({ ...formData, timeSlot: text })}
        />
        
        <TextInput
          style={[styles.input, styles.reasonInput]}
          placeholder="Reason for Visit"
          multiline
          numberOfLines={4}
          value={formData.reason}
          onChangeText={(text) => setFormData({ ...formData, reason: text })}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.buttonText}>Confirm Booking</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  appointmentInfo: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 5,
  },
  form: {
    gap: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  reasonInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 10,
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#2ecc71',
    padding: 15,
    borderRadius: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 