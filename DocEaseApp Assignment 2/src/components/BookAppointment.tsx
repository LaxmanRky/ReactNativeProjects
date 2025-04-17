import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput } from 'react-native';
import { useFirestore } from '../hooks/useFirestore';
import { Doctor, Appointment } from '../types/firebase';

interface BookAppointmentProps {
  doctorId: string;
  patientId: string;
  patientName: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const BookAppointment: React.FC<BookAppointmentProps> = ({ 
  doctorId, 
  patientId, 
  patientName, 
  onSuccess, 
  onCancel 
}) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);
  
  const { 
    loading, 
    error, 
    getDoctorById, 
    createAppointment 
  } = useFirestore();

  // Load doctor details
  useEffect(() => {
    const loadDoctor = async () => {
      const doctorData = await getDoctorById(doctorId);
      if (doctorData) {
        setDoctor(doctorData);
        
        // Extract available dates from doctor's availability
        if (doctorData.availability) {
          const dates = Object.keys(doctorData.availability);
          setAvailableDates(dates);
        }
      }
    };
    
    loadDoctor();
  }, [doctorId, getDoctorById]);

  // Update available times when date is selected
  useEffect(() => {
    if (selectedDate && doctor?.availability?.[selectedDate]) {
      setAvailableTimes(doctor.availability[selectedDate]);
    } else {
      setAvailableTimes([]);
    }
    
    // Reset selected time when date changes
    setSelectedTime('');
  }, [selectedDate, doctor]);

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
  };

  const handleBookAppointment = async () => {
    if (!doctor || !selectedDate || !selectedTime || !reason) {
      Alert.alert('Error', 'Please fill in all appointment details');
      return;
    }

    const appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'> = {
      doctorId,
      doctorName: doctor.name,
      patientId,
      patientName,
      date: selectedDate,
      time: selectedTime,
      status: 'scheduled',
      reason,
    };

    const appointmentId = await createAppointment(appointment);
    
    if (appointmentId) {
      Alert.alert(
        'Success', 
        'Your appointment has been booked successfully!',
        [{ text: 'OK', onPress: onSuccess }]
      );
    } else {
      Alert.alert('Error', 'Failed to book appointment. Please try again.');
    }
  };

  if (loading && !doctor) {
    return (
      <View style={styles.container}>
        <Text>Loading doctor information...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={styles.container}>
        <Text>Doctor not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.doctorInfo}>
        <Text style={styles.doctorName}>{doctor.name}</Text>
        <Text style={styles.doctorSpecialization}>{doctor.specialization}</Text>
        <Text style={styles.doctorHospital}>{doctor.hospital}</Text>
      </View>

      <Text style={styles.sectionTitle}>Select Date</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.datesList}>
        {availableDates.map((date) => (
          <TouchableOpacity
            key={date}
            style={[
              styles.dateItem,
              selectedDate === date && styles.selectedItem
            ]}
            onPress={() => handleDateSelect(date)}
          >
            <Text style={selectedDate === date ? styles.selectedText : styles.dateText}>
              {date}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedDate && (
        <>
          <Text style={styles.sectionTitle}>Select Time</Text>
          <View style={styles.timesList}>
            {availableTimes.map((time) => (
              <TouchableOpacity
                key={time}
                style={[
                  styles.timeItem,
                  selectedTime === time && styles.selectedItem
                ]}
                onPress={() => handleTimeSelect(time)}
              >
                <Text style={selectedTime === time ? styles.selectedText : styles.timeText}>
                  {time}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}

      {selectedDate && selectedTime && (
        <>
          <Text style={styles.sectionTitle}>Reason for Visit</Text>
          <TextInput
            style={styles.reasonInput}
            placeholder="Please describe your symptoms or reason for visit"
            multiline
            numberOfLines={4}
            value={reason}
            onChangeText={setReason}
          />
        </>
      )}

      <View style={styles.bookingActions}>
        <TouchableOpacity
          style={[
            styles.bookButton,
            (!selectedDate || !selectedTime || !reason) && styles.disabledButton
          ]}
          disabled={!selectedDate || !selectedTime || !reason}
          onPress={handleBookAppointment}
        >
          <Text style={styles.bookButtonText}>Book Appointment</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelButton} onPress={onCancel}>
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  doctorInfo: {
    marginBottom: 24,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  doctorSpecialization: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  doctorHospital: {
    fontSize: 14,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 16,
  },
  datesList: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dateItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  dateText: {
    fontSize: 14,
  },
  timesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  timeItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 14,
  },
  reasonInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  selectedItem: {
    backgroundColor: '#4a90e2',
  },
  selectedText: {
    color: '#fff',
  },
  bookingActions: {
    marginTop: 24,
  },
  bookButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  disabledButton: {
    backgroundColor: '#a5d6a7',
    opacity: 0.7,
  },
  errorText: {
    color: 'red',
    marginBottom: 12,
  },
});

export default BookAppointment; 