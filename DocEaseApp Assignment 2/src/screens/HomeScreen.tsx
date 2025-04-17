import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text, TextInput, Button, Card, Title, Paragraph, Chip, useTheme, RadioButton } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { Doctor } from '../types/doctor';
import { auth } from '../firebase/config';
import { AppointmentFormData, saveUserAppointment } from '../utils/userDataStorage';

// Mock doctors data to use if Firestore fetch fails
const MOCK_DOCTORS: Doctor[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    department: 'Cardiology',
    experience: 15,
    education: 'MD, Cardiology, Harvard Medical School',
    image: 'https://randomuser.me/api/portraits/women/33.jpg',
    online: true
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    department: 'Dermatology',
    experience: 10,
    education: 'MD, Dermatology, Johns Hopkins University',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    online: true
  },
  {
    id: '3',
    name: 'Dr. Emily Williams',
    department: 'Pediatrics',
    experience: 12,
    education: 'MD, Pediatrics, Stanford University',
    image: 'https://randomuser.me/api/portraits/women/32.jpg',
    online: false
  },
  {
    id: '4',
    name: 'Dr. Robert Thompson',
    department: 'Neurology',
    experience: 18,
    education: 'MD, Neurology, Yale University',
    image: 'https://randomuser.me/api/portraits/men/42.jpg',
    online: true
  },
  {
    id: '5',
    name: 'Dr. Jennifer Martinez',
    department: 'Orthopedics',
    experience: 14,
    education: 'MD, Orthopedic Surgery, Johns Hopkins University',
    image: 'https://randomuser.me/api/portraits/women/45.jpg',
    online: true
  },
  {
    id: '6',
    name: 'Dr. David Wilson',
    department: 'Ophthalmology',
    experience: 16,
    education: 'MD, Ophthalmology, Duke University',
    image: 'https://randomuser.me/api/portraits/men/29.jpg',
    online: false
  },
  {
    id: '7',
    name: 'Dr. Lisa Brown',
    department: 'Gynecology',
    experience: 12,
    education: 'MD, Obstetrics & Gynecology, Columbia University',
    image: 'https://randomuser.me/api/portraits/women/28.jpg',
    online: true
  },
  {
    id: '8',
    name: 'Dr. Kevin Patel',
    department: 'Dentistry',
    experience: 9,
    education: 'DDS, University of California',
    image: 'https://randomuser.me/api/portraits/men/46.jpg',
    online: true
  }
];

export const HomeScreen: React.FC = () => {
  const theme = useTheme();
  const [doctors] = useState<Doctor[]>(MOCK_DOCTORS);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [appointmentType, setAppointmentType] = useState('online');
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    reason: '',
    timeSlot: '09:00 AM',
  });
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Available time slots
  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', 
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM'
  ];

  useEffect(() => {
    // Check current user authentication status
    const unsubscribe = auth.onAuthStateChanged(user => {
      setCurrentUser(user);
      if (user?.displayName && !formData.fullName) {
        // Pre-fill user data if available
        setFormData(prevData => ({
          ...prevData,
          fullName: user.displayName || '',
          email: user.email || '',
        }));
      }
    });

    const fetchDoctors = async () => {
      try {
        // Attempt to fetch doctors from Firestore is commented out due to config issues
        // Will use the mock data for now
        console.log('Using mock doctors data');
      } catch (error) {
        console.error('Error fetching doctors:', error);
      }
    };

    fetchDoctors();
    
    // Clean up subscription
    return () => unsubscribe();
  }, [formData.fullName]);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setAppointmentDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    // Basic validation
    if (!selectedDoctor) {
      Alert.alert('Error', 'Please select a doctor');
      return;
    }
    
    if (!formData.fullName || !formData.phoneNumber || !formData.reason) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!currentUser) {
      Alert.alert('Authentication Required', 'Please log in to book an appointment');
      return;
    }

    try {
      // Create user-specific appointment data
      const appointmentData: AppointmentFormData = {
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        department: selectedDoctor.department,
        patientName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: formData.email,
        appointmentDate: format(appointmentDate, 'yyyy-MM-dd'),
        timeSlot: formData.timeSlot,
        reason: formData.reason,
        appointmentType: appointmentType,
        online: appointmentType === 'online'
      };

      // Save the appointment using our utility function
      console.log('Appointment data:', appointmentData);
      
      // Save to Firestore
      const appointmentId = await saveUserAppointment(appointmentData);
      
      if (!appointmentId) {
        throw new Error('Failed to save appointment');
      }
      
      Alert.alert(
        'Success',
        'Your appointment has been successfully submitted. We will contact you shortly to confirm.',
        [{ text: 'OK', onPress: () => resetForm() }]
      );
    } catch (error) {
      console.error('Error booking appointment:', error);
      Alert.alert('Error', 'There was an error submitting your appointment. Please try again.');
    }
  };

  const resetForm = () => {
    setSelectedDoctor(null);
    setAppointmentDate(new Date());
    setFormData(() => ({
      // Keep user information if logged in
      fullName: currentUser?.displayName || '',
      email: currentUser?.email || '',
      phoneNumber: '',
      reason: '',
      timeSlot: '09:00 AM',
    }));
    setAppointmentType('online');
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Title style={styles.headerTitle}>Book Your Appointment</Title>
          <Paragraph style={styles.headerSubtitle}>
            Fill out the form below to schedule an appointment with one of our specialists
          </Paragraph>
          {currentUser ? (
            <Text style={styles.userInfo}>Logged in as: {currentUser.email}</Text>
          ) : (
            <Text style={styles.userWarning}>Please log in to save your appointments</Text>
          )}
        </Card.Content>
      </Card>

      <View style={styles.formContainer}>
        <Text style={styles.sectionTitle}>Select Doctor</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.doctorSelector}>
          {doctors.map((doctor) => (
            <TouchableOpacity 
              key={doctor.id} 
              onPress={() => setSelectedDoctor(doctor)}
              style={[
                styles.doctorCard,
                selectedDoctor?.id === doctor.id && { borderColor: theme.colors.primary, borderWidth: 2 }
              ]}
            >
              <Text style={styles.doctorName}>{doctor.name}</Text>
              <Chip style={styles.specialtyChip}>{doctor.department}</Chip>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {selectedDoctor && (
          <View style={styles.appointmentForm}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <TextInput
              label="Full Name *"
              value={formData.fullName}
              onChangeText={(text) => setFormData({ ...formData, fullName: text })}
              style={styles.input}
              mode="outlined"
            />
            
            <TextInput
              label="Phone Number *"
              value={formData.phoneNumber}
              onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
              style={styles.input}
              mode="outlined"
              keyboardType="phone-pad"
            />
            
            <TextInput
              label="Email Address"
              value={formData.email}
              onChangeText={(text) => setFormData({ ...formData, email: text })}
              style={styles.input}
              mode="outlined"
              keyboardType="email-address"
            />
            
            <Text style={styles.sectionTitle}>Appointment Details</Text>
            
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Select Date:</Text>
              <Button 
                mode="outlined" 
                onPress={() => setShowDatePicker(true)}
                style={styles.dateButton}
              >
                {format(appointmentDate, 'MMMM dd, yyyy')}
              </Button>
            </View>
            
            {showDatePicker && (
              <DateTimePicker
                value={appointmentDate}
                mode="date"
                display="default"
                onChange={handleDateChange}
                minimumDate={new Date()}
              />
            )}
            
            <Text style={styles.labelText}>Select Time Slot:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.timeSlotsContainer}>
              {timeSlots.map((slot) => (
                <TouchableOpacity
                  key={slot}
                  onPress={() => setFormData({ ...formData, timeSlot: slot })}
                  style={[
                    styles.timeSlot,
                    formData.timeSlot === slot && { backgroundColor: theme.colors.primaryContainer }
                  ]}
                >
                  <Text style={formData.timeSlot === slot ? styles.selectedTimeText : styles.timeText}>{slot}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <Text style={styles.labelText}>Appointment Type:</Text>
            <View style={styles.radioGroup}>
              <View style={styles.radioButton}>
                <RadioButton
                  value="online"
                  status={appointmentType === 'online' ? 'checked' : 'unchecked'}
                  onPress={() => setAppointmentType('online')}
                  color={theme.colors.primary}
                />
                <Text>Online Consultation</Text>
              </View>
              <View style={styles.radioButton}>
                <RadioButton
                  value="in-person"
                  status={appointmentType === 'in-person' ? 'checked' : 'unchecked'}
                  onPress={() => setAppointmentType('in-person')}
                  color={theme.colors.primary}
                />
                <Text>In-Person Visit</Text>
              </View>
            </View>
            
            <TextInput
              label="Reason for Visit *"
              value={formData.reason}
              onChangeText={(text) => setFormData({ ...formData, reason: text })}
              style={styles.reasonInput}
              mode="outlined"
              multiline
              numberOfLines={4}
            />
            
            <Button 
              mode="contained" 
              onPress={handleSubmit}
              style={styles.submitButton}
            >
              Book Appointment
            </Button>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    margin: 16,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 22,
    textAlign: 'center',
    color: '#333',
  },
  headerSubtitle: {
    textAlign: 'center',
    marginTop: 8,
    color: '#666',
  },
  userInfo: {
    textAlign: 'center',
    marginTop: 8,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  userWarning: {
    textAlign: 'center',
    marginTop: 8,
    color: '#FF9800',
    fontStyle: 'italic',
  },
  formContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#333',
  },
  doctorSelector: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  doctorCard: {
    padding: 12,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 140,
    alignItems: 'center',
  },
  doctorName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  specialtyChip: {
    marginTop: 4,
  },
  appointmentForm: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  input: {
    marginBottom: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  dateLabel: {
    flex: 1,
  },
  dateButton: {
    flex: 2,
  },
  labelText: {
    marginTop: 8,
    marginBottom: 8,
    fontSize: 16,
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  timeSlot: {
    padding: 8,
    borderRadius: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    minWidth: 80,
    alignItems: 'center',
  },
  timeText: {
    color: '#333',
  },
  selectedTimeText: {
    fontWeight: 'bold',
  },
  radioGroup: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  reasonInput: {
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 24,
    paddingVertical: 8,
  },
}); 