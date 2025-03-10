import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  FlatList,
  Platform
} from 'react-native';
import authController from '../controllers/AuthController';

const doctorsData = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    specialty: 'Cardiologist',
    availability: 'Mon, Wed, Fri: 9AM - 5PM',
    rating: 4.8,
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    status: 'Available'
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    specialty: 'Pediatrician',
    availability: 'Mon-Fri: 8AM - 4PM',
    rating: 4.9,
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    status: 'Available'
  },
  {
    id: '3',
    name: 'Dr. Emily Rodriguez',
    specialty: 'Dermatologist',
    availability: 'Tue, Thu: 10AM - 6PM',
    rating: 4.7,
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
    status: 'Busy'
  },
  {
    id: '4',
    name: 'Dr. James Wilson',
    specialty: 'Orthopedic Surgeon',
    availability: 'Mon, Wed, Fri: 8AM - 2PM',
    rating: 4.6,
    image: 'https://randomuser.me/api/portraits/men/52.jpg',
    status: 'Available'
  },
  {
    id: '5',
    name: 'Dr. Lisa Thompson',
    specialty: 'Neurologist',
    availability: 'Mon-Thu: 9AM - 5PM',
    rating: 4.9,
    image: 'https://randomuser.me/api/portraits/women/24.jpg',
    status: 'Unavailable'
  },
  {
    id: '6',
    name: 'Dr. Robert Kim',
    specialty: 'Psychiatrist',
    availability: 'Tue, Thu, Fri: 11AM - 7PM',
    rating: 4.8,
    image: 'https://randomuser.me/api/portraits/men/42.jpg',
    status: 'Available'
  }
];

// Sample specialties
const specialties = [
  { id: '1', name: 'Cardiology', icon: '❤️' },
  { id: '2', name: 'Pediatrics', icon: '👶' },
  { id: '3', name: 'Dermatology', icon: '🧴' },
  { id: '4', name: 'Orthopedics', icon: '🦴' },
  { id: '5', name: 'Neurology', icon: '🧠' },
  { id: '6', name: 'Psychiatry', icon: '🧠' },
  { id: '7', name: 'General', icon: '👨‍⚕️' },
];

const DoctorCard = ({ doctor, onPress }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'Available': return '#4CAF50';
      case 'Busy': return '#FF9800';
      case 'Unavailable': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <TouchableOpacity style={styles.doctorCard} onPress={onPress}>
      <View style={styles.doctorHeader}>
        <Image source={{ uri: doctor.image }} style={styles.doctorImage} />
        <View style={styles.doctorInfo}>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.doctorSpecialty}>{doctor.specialty}</Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>⭐ {doctor.rating}</Text>
          </View>
        </View>
      </View>
      <View style={styles.doctorFooter}>
        <Text style={styles.availabilityText}>{doctor.availability}</Text>
        <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(doctor.status) }]}>
          <Text style={styles.statusText}>{doctor.status}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const SpecialtyButton = ({ specialty, selected, onPress }) => (
  <TouchableOpacity 
    style={[styles.specialtyButton, selected && styles.specialtyButtonSelected]} 
    onPress={onPress}
  >
    <Text style={styles.specialtyIcon}>{specialty.icon}</Text>
    <Text style={[styles.specialtyText, selected && styles.specialtyTextSelected]}>
      {specialty.name}
    </Text>
  </TouchableOpacity>
);

const HomeScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [doctors, setDoctors] = useState(doctorsData);
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);

  useEffect(() => {
    // Get current user when component mounts
    const currentUser = authController.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await authController.logoutUser();
      setLoading(false);
      
      // For web environment
      if (Platform.OS === 'web') {
        // Clear any local storage or session data
        localStorage.removeItem('user');
        sessionStorage.removeItem('user');
        
        // Redirect to login page
        window.location.href = '/login';
      } else {
        // For mobile environment
        // Navigate back to Login screen
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Logout Failed', error.message);
    }
  };

  const filterDoctorsBySpecialty = (specialty) => {
    if (specialty === selectedSpecialty) {
      // If the same specialty is selected, clear the filter
      setSelectedSpecialty(null);
      setDoctors(doctorsData);
    } else {
      setSelectedSpecialty(specialty);
      // Filter doctors by specialty
      const filtered = doctorsData.filter(doctor => 
        doctor.specialty.toLowerCase().includes(specialty.name.toLowerCase())
      );
      setDoctors(filtered);
    }
  };

  const handleDoctorPress = (doctor) => {
    Alert.alert(
      `Book Appointment with ${doctor.name}`,
      `Would you like to schedule an appointment with ${doctor.name}, ${doctor.specialty}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Book Now', 
          onPress: () => Alert.alert('Success', 'Appointment request sent! You will receive a confirmation shortly.') 
        }
      ]
    );
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome,</Text>
          <Text style={styles.nameText}>{user.displayName || user.email}</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton} 
          onPress={() => navigation.navigate('Profile')}
        >
          <Text style={styles.profileButtonText}>👤</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.searchSection}>
          <Text style={styles.sectionTitle}>Find Doctors</Text>
          <Text style={styles.sectionSubtitle}>Book appointments with the best doctors</Text>
        </View>

        <View style={styles.specialtiesContainer}>
          <Text style={styles.sectionTitle}>Specialties</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.specialtiesScrollView}
          >
            {specialties.map((specialty) => (
              <SpecialtyButton 
                key={specialty.id} 
                specialty={specialty} 
                selected={selectedSpecialty === specialty}
                onPress={() => filterDoctorsBySpecialty(specialty)}
              />
            ))}
          </ScrollView>
        </View>

        <View style={styles.doctorsSection}>
          <Text style={styles.sectionTitle}>Available Doctors</Text>
          <Text style={styles.sectionSubtitle}>
            {selectedSpecialty ? `Showing ${selectedSpecialty.name} specialists` : 'Showing all doctors'}
          </Text>
          
          {doctors.length === 0 ? (
            <View style={styles.noDoctorsContainer}>
              <Text style={styles.noDoctorsText}>No doctors available for this specialty</Text>
            </View>
          ) : (
            doctors.map(doctor => (
              <DoctorCard 
                key={doctor.id} 
                doctor={doctor} 
                onPress={() => handleDoctorPress(doctor)}
              />
            ))
          )}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.logoutButton]} 
          onPress={handleLogout}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Logout</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: '#3498db',
  },
  welcomeText: {
    fontSize: 16,
    color: '#e8f4fc',
  },
  nameText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileButtonText: {
    fontSize: 20,
  },
  searchSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  specialtiesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  specialtiesScrollView: {
    paddingVertical: 10,
  },
  specialtyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  specialtyButtonSelected: {
    backgroundColor: '#3498db',
  },
  specialtyIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  specialtyText: {
    fontSize: 14,
    color: '#2c3e50',
  },
  specialtyTextSelected: {
    color: '#ffffff',
  },
  doctorsSection: {
    padding: 20,
  },
  doctorCard: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  doctorHeader: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  doctorImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  doctorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#f39c12',
  },
  doctorFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 10,
  },
  availabilityText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  statusIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  noDoctorsContainer: {
    padding: 20,
    alignItems: 'center',
  },
  noDoctorsText: {
    fontSize: 16,
    color: '#7f8c8d',
  },
  footer: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  logoutButton: {
    backgroundColor: '#e74c3c',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default HomeScreen;
