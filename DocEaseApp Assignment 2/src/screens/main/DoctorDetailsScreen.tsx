import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Button,
  Avatar,
  useTheme,
  Divider,
  Surface,
  IconButton,
  ActivityIndicator,
  Portal,
  Modal,
  TextInput,
  Card,
} from 'react-native-paper';
import { auth, db } from '../../firebase/config';

interface DoctorDetailsScreenProps {
  route: {
    params: {
      doctorId: string;
    };
  };
  navigation: any;
}

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  availability?: string;
  imageUrl?: string;
  hospital?: string;
  fees?: number;
  bio?: string;
  education?: string[];
  languages?: string[];
  reviews?: number;
  address?: string;
}

interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

// Mock doctors data
const MOCK_DOCTORS: Record<string, Doctor> = {
  '1': {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialization: 'Cardiologist',
    experience: 15,
    rating: 4.8,
    availability: 'Available Today',
    hospital: 'City Medical Center',
    fees: 120,
    imageUrl: 'https://randomuser.me/api/portraits/women/33.jpg',
    bio: 'Dr. Sarah Johnson is a board-certified cardiologist with over 15 years of experience in treating heart conditions. She specializes in preventive cardiology and heart disease management.',
    education: ['MD, Harvard Medical School', 'Board Certified in Cardiology'],
    languages: ['English', 'Spanish'],
    reviews: 72,
    address: '123 Medical Plaza, Suite 500, City, ST 12345',
  },
  '2': {
    id: '2',
    name: 'Dr. Michael Chen',
    specialization: 'Dermatologist',
    experience: 10,
    rating: 4.7,
    availability: 'Next Available: Tomorrow',
    hospital: 'Dermatology Clinic',
    fees: 150,
    imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    bio: 'Dr. Michael Chen is a dermatologist specializing in medical and cosmetic dermatology. He has expertise in treating skin conditions including acne, eczema, and psoriasis.',
    education: ['MD, Stanford University', 'Residency in Dermatology, UCLA'],
    languages: ['English', 'Mandarin'],
    reviews: 58,
    address: '456 Skin Care Blvd, City, ST 12345',
  },
  '3': {
    id: '3',
    name: 'Dr. Emily Williams',
    specialization: 'Pediatrician',
    experience: 12,
    rating: 4.9,
    availability: 'Available Today',
    hospital: 'Children\'s Hospital',
    fees: 100,
    imageUrl: 'https://randomuser.me/api/portraits/women/32.jpg',
    bio: 'Dr. Emily Williams is a compassionate pediatrician dedicated to providing comprehensive care for children from birth through adolescence.',
    education: ['MD, Johns Hopkins University', 'Fellowship in Pediatrics'],
    languages: ['English', 'French'],
    reviews: 85,
    address: '789 Children\'s Way, City, ST 12345',
  },
  '4': {
    id: '4',
    name: 'Dr. David Rodriguez',
    specialization: 'Neurologist',
    experience: 18,
    rating: 4.6,
    availability: 'Available Today',
    hospital: 'Neurology Center',
    fees: 200,
    imageUrl: 'https://randomuser.me/api/portraits/men/45.jpg',
    bio: 'Dr. David Rodriguez is a neurologist with expertise in diagnosing and treating disorders of the nervous system, including headaches, epilepsy, and stroke.',
    education: ['MD, University of Pennsylvania', 'Neurology Residency, Mayo Clinic'],
    languages: ['English', 'Spanish'],
    reviews: 64,
    address: '321 Brain Health Dr, City, ST 12345',
  },
  '5': {
    id: '5',
    name: 'Dr. Jennifer Martinez',
    specialization: 'Orthopedic',
    experience: 14,
    rating: 4.5,
    availability: 'Next Available: Tomorrow',
    hospital: 'Orthopedic Specialists',
    fees: 180,
    imageUrl: 'https://randomuser.me/api/portraits/women/45.jpg',
    bio: 'Dr. Jennifer Martinez is an orthopedic surgeon specializing in sports medicine and joint replacement surgery. She is dedicated to helping patients regain mobility and quality of life.',
    education: ['MD, Columbia University', 'Orthopedic Surgery Residency, Hospital for Special Surgery'],
    languages: ['English', 'Portuguese'],
    reviews: 59,
    address: '555 Joint Health Ave, City, ST 12345',
  }
};

const DoctorDetailsScreen: React.FC<DoctorDetailsScreenProps> = ({
  route,
  navigation,
}) => {
  const { doctorId } = route.params;
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getFormattedDate(new Date()));
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [bookingVisible, setBookingVisible] = useState(false);
  const [bookingReason, setBookingReason] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  
  const theme = useTheme();

  // Set up the header with a back button
  useLayoutEffect(() => {
    navigation.setOptions({
      // Remove custom back button as it's causing duplication with default back button
    });
  }, [navigation]);

  // Generate next 5 days for date selection
  const dateOptions = [...Array(5)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return {
      id: i.toString(),
      date: getFormattedDate(date),
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dateNum: date.getDate(),
    };
  });

  // Generate time slots
  const timeSlots: TimeSlot[] = [
    { id: '1', time: '09:00 AM', available: true },
    { id: '2', time: '10:00 AM', available: true },
    { id: '3', time: '11:00 AM', available: false },
    { id: '4', time: '12:00 PM', available: true },
    { id: '5', time: '02:00 PM', available: true },
    { id: '6', time: '03:00 PM', available: true },
    { id: '7', time: '04:00 PM', available: false },
    { id: '8', time: '05:00 PM', available: true },
  ];

  function getFormattedDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        setLoading(true);
        
        // Use mock data instead of Firestore
        setTimeout(() => {
          const doctorData = MOCK_DOCTORS[doctorId];
          
          if (doctorData) {
            setDoctor(doctorData);
          } else {
            // Use a default doctor if ID not found
            setDoctor({
              id: doctorId,
              name: 'Dr. Sarah Johnson',
              specialization: 'Cardiologist',
              experience: 15,
              rating: 4.8,
              availability: 'Available Today',
              hospital: 'City Medical Center',
              fees: 120,
              bio: 'A dedicated cardiologist with 15 years of experience in treating heart conditions.',
              education: ['MD, Harvard Medical School', 'Board Certified in Cardiology'],
              languages: ['English', 'Spanish'],
              reviews: 72,
              address: '123 Medical Plaza, Suite 500, City, ST 12345',
            });
          }
          setLoading(false);
        }, 500); // Simulate loading delay
      } catch (err) {
        console.error('Error fetching doctor details:', err);
        setError('Failed to load doctor details');
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [doctorId]);

  const handleBookAppointment = async () => {
    if (!selectedSlot) {
      Alert.alert('Please select a time slot');
      return;
    }

    if (!auth.currentUser) {
      Alert.alert('Please log in to book an appointment');
      navigation.navigate('Login');
      return;
    }

    setBookingLoading(true);
    
    try {
      // Create appointment data
      if (!doctor) {
        throw new Error('Doctor information is missing');
      }
      
      console.log('Starting appointment booking process...');
      
      // Get current user information
      const currentUser = auth.currentUser;
      const userEmail = currentUser.email || '';
      const displayName = currentUser.displayName || 'Patient';
      const userId = currentUser.uid;
      
      // Create a detailed appointment object
      const appointmentData = {
        doctorId: doctor.id,
        doctorName: doctor.name,
        department: doctor.specialization, // Using specialization as department
        patientName: displayName,
        phoneNumber: '', // This would need to be collected in a real app
        email: userEmail,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot.time,
        reason: bookingReason || 'General consultation',
        appointmentType: 'in-person', // Default type
        online: false,
      };
      
      console.log('Appointment data prepared:', appointmentData);
      
      // Prepare the appointment with user metadata
      const appointmentWithMetadata = {
        ...appointmentData,
        userId: userId,
        userEmail: userEmail,
        createdAt: new Date().toISOString(),
        status: 'pending',
        lastUpdated: new Date().toISOString(),
      };
      
      // Store in user-specific subcollection
      console.log(`Saving to user's appointments collection for user ID: ${userId}...`);
      const userAppointmentsRef = db.collection('users').doc(userId).collection('appointments');
      const docRef = await userAppointmentsRef.add(appointmentWithMetadata);
      console.log('Saved to user\'s appointments with ID:', docRef.id);
      
      // Also store in global appointments collection with reference to user appointment
      console.log('Saving to global appointments collection...');
      const globalAppointmentsRef = db.collection('appointments');
      await globalAppointmentsRef.add({
        ...appointmentWithMetadata,
        appointmentId: docRef.id,
        userRef: db.collection('users').doc(userId)
      });
      console.log('Saved to global appointments collection successfully');
      
      // Update the doctor's availability if needed (could be implemented in the future)
      
      setBookingVisible(false);
      Alert.alert(
        'Appointment Booked',
        `Your appointment with ${doctor.name} has been booked for ${selectedDate} at ${selectedSlot.time}.`,
        [
          {
            text: 'OK',
            onPress: () => {
              console.log('Navigating to Appointments screen after booking');
              // Navigate to the Appointments tab to show the newly booked appointment
              navigation.navigate('MainTabs', { 
                screen: 'Appointments',
                initial: false
              });
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error booking appointment:', error);
      Alert.alert('Error', 'There was a problem booking your appointment. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !doctor) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'Doctor not found'}</Text>
        <Button mode="contained" onPress={() => navigation.goBack()}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Surface style={styles.header} elevation={2}>
          <View style={styles.profileHeader}>
            <Avatar.Image
              size={100}
              source={{
                uri: doctor.imageUrl || 'https://randomuser.me/api/portraits/men/32.jpg',
              }}
            />
            <View style={styles.profileInfo}>
              <Text variant="titleLarge">{doctor.name}</Text>
              <Text variant="titleSmall">{doctor.specialization}</Text>
              <View style={styles.ratingContainer}>
                <IconButton icon="star" size={20} style={styles.ratingIcon} />
                <Text variant="bodyMedium">{doctor.rating} • {doctor.reviews} Reviews</Text>
              </View>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text variant="titleMedium">{doctor.experience}+</Text>
              <Text variant="bodySmall">Years Exp</Text>
            </View>
            <Divider style={styles.verticalDivider} />
            <View style={styles.statItem}>
              <Text variant="titleMedium">{doctor.reviews}+</Text>
              <Text variant="bodySmall">Patients</Text>
            </View>
            <Divider style={styles.verticalDivider} />
            <View style={styles.statItem}>
              <Text variant="titleMedium">${doctor.fees}</Text>
              <Text variant="bodySmall">Fee</Text>
            </View>
          </View>
        </Surface>

        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>About Doctor</Text>
            <Text variant="bodyMedium" style={styles.bioText}>
              {doctor.bio}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>Education</Text>
            {doctor.education?.map((edu, index) => (
              <View key={index} style={styles.educationItem}>
                <IconButton icon="school" size={20} />
                <Text variant="bodyMedium">{edu}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Hospital Address
            </Text>
            <View style={styles.hospitalContainer}>
              <IconButton icon="hospital-building" size={20} />
              <View>
                <Text variant="bodyMedium">{doctor.hospital}</Text>
                <Text variant="bodySmall">{doctor.address}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.section}>
          <Card.Content>
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Book Appointment
            </Text>
            <Text variant="bodyMedium" style={styles.appointmentSubtitle}>
              Select Date
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.dateList}>
                {dateOptions.map((dateOption) => (
                  <TouchableOpacity
                    key={dateOption.id}
                    style={[
                      styles.dateItem,
                      selectedDate === dateOption.date && {
                        backgroundColor: theme.colors.primaryContainer,
                      },
                    ]}
                    onPress={() => setSelectedDate(dateOption.date)}>
                    <Text
                      style={[
                        styles.dateDay,
                        selectedDate === dateOption.date && {
                          color: theme.colors.primary,
                        },
                      ]}>
                      {dateOption.day}
                    </Text>
                    <Text
                      style={[
                        styles.dateNum,
                        selectedDate === dateOption.date && {
                          color: theme.colors.primary,
                        },
                      ]}>
                      {dateOption.dateNum}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <Text variant="bodyMedium" style={styles.appointmentSubtitle}>
              Available Time Slots
            </Text>
            <View style={styles.timeSlotList}>
              {timeSlots.map((slot) => (
                <TouchableOpacity
                  key={slot.id}
                  style={[
                    styles.timeSlot,
                    !slot.available && styles.unavailableSlot,
                    selectedSlot?.id === slot.id && {
                      backgroundColor: theme.colors.primaryContainer,
                    },
                  ]}
                  disabled={!slot.available}
                  onPress={() => setSelectedSlot(slot)}>
                  <Text
                    style={[
                      styles.timeSlotText,
                      !slot.available && styles.unavailableText,
                      selectedSlot?.id === slot.id && {
                        color: theme.colors.primary,
                      },
                    ]}>
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <Surface style={styles.footer} elevation={4}>
        <View style={styles.footerContent}>
          <View>
            <Text variant="titleMedium">${doctor.fees}</Text>
            <Text variant="bodySmall">Consultation Fee</Text>
          </View>
          <Button
            mode="contained"
            onPress={() => setBookingVisible(true)}
            style={styles.bookButton}>
            Book Appointment
          </Button>
        </View>
      </Surface>

      <Portal>
        <Modal
          visible={bookingVisible}
          onDismiss={() => setBookingVisible(false)}
          contentContainerStyle={styles.modalContainer}>
          <Text variant="titleLarge" style={styles.modalTitle}>
            Confirm Appointment
          </Text>
          <Text variant="bodyMedium" style={styles.modalSubtitle}>
            {doctor.name} - {doctor.specialization}
          </Text>
          <Divider style={styles.modalDivider} />
          <View style={styles.appointmentDetails}>
            <View style={styles.appointmentDetailItem}>
              <IconButton icon="calendar" size={20} />
              <Text variant="bodyMedium">
                {new Date(selectedDate).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </View>
            <View style={styles.appointmentDetailItem}>
              <IconButton icon="clock-outline" size={20} />
              <Text variant="bodyMedium">{selectedSlot?.time || 'No time selected'}</Text>
            </View>
            <View style={styles.appointmentDetailItem}>
              <IconButton icon="cash" size={20} />
              <Text variant="bodyMedium">${doctor.fees} Consultation Fee</Text>
            </View>
          </View>
          <TextInput
            label="Reason for Visit"
            value={bookingReason}
            onChangeText={setBookingReason}
            mode="outlined"
            multiline
            numberOfLines={3}
            style={styles.reasonInput}
          />
          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={() => setBookingVisible(false)}
              style={styles.modalButton}>
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleBookAppointment}
              loading={bookingLoading}
              disabled={bookingLoading}
              style={styles.modalButton}>
              Confirm Booking
            </Button>
          </View>
        </Modal>
      </Portal>
    </SafeAreaView>
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    marginBottom: 16,
    color: '#ff0000',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingIcon: {
    margin: 0,
    marginLeft: -8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    marginTop: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  verticalDivider: {
    height: '100%',
    width: 1,
    backgroundColor: '#e0e0e0',
  },
  section: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  bioText: {
    lineHeight: 22,
  },
  educationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  hospitalContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  appointmentSubtitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  dateList: {
    flexDirection: 'row',
    marginVertical: 8,
  },
  dateItem: {
    width: 60,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  dateDay: {
    fontSize: 14,
  },
  dateNum: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 4,
  },
  timeSlotList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  timeSlot: {
    width: '30%',
    paddingVertical: 12,
    marginRight: '3%',
    marginBottom: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  unavailableSlot: {
    backgroundColor: '#f5f5f5',
    opacity: 0.6,
  },
  timeSlotText: {
    fontWeight: '500',
  },
  unavailableText: {
    color: '#aaa',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  footerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookButton: {
    paddingHorizontal: 16,
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontWeight: 'bold',
  },
  modalSubtitle: {
    marginTop: 4,
    color: '#666',
  },
  modalDivider: {
    marginVertical: 16,
  },
  appointmentDetails: {
    marginBottom: 16,
  },
  appointmentDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reasonInput: {
    marginVertical: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  modalButton: {
    marginLeft: 8,
  },
});

export default DoctorDetailsScreen; 