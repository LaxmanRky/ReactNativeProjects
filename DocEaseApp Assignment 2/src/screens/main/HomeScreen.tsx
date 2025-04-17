import React, { useState, useEffect } from 'react';
import {View, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import {
  Text,
  Button,
  Surface,
  Avatar,
  Card,
  Searchbar,
  IconButton,
  Divider,
} from 'react-native-paper';
import CardComponent from '../../components/CardComponent';
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { db, auth } from '../../firebase/config';

interface HomeScreenProps {
  navigation: any;
}

interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  avatar?: string;
  status: string;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  avatar?: string;
  experience?: number;
}

const HomeScreen: React.FC<HomeScreenProps> = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [topSpecialists, setTopSpecialists] = useState<Doctor[]>([]);
  const [userName, setUserName] = useState('User');

  // Fetch user details
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser && currentUser.displayName) {
      setUserName(currentUser.displayName);
    }
  }, []);

  // Fetch appointments from Firebase
  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const today = new Date();
        const appointmentsRef = collection(db, 'appointments');
        const q = query(
          appointmentsRef,
          where('patientId', '==', userId),
          where('status', '!=', 'cancelled'),
          where('date', '>=', today.toISOString().split('T')[0]),
          orderBy('date', 'asc'),
          limit(2)
        );

        const querySnapshot = await getDocs(q);
        const appointmentsData: Appointment[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          appointmentsData.push({
            id: doc.id,
            doctorName: data.doctorName || 'Unknown Doctor',
            specialty: data.specialty || 'Specialist',
            date: data.date || 'Pending',
            time: data.time || 'Pending',
            avatar: data.doctorAvatar || 'https://randomuser.me/api/portraits/men/32.jpg',
            status: data.status || 'scheduled',
          });
        });

        setUpcomingAppointments(appointmentsData);
      } catch (error) {
        console.error('Error fetching appointments:', error);
        // Fallback to dummy data if there's an error
        setUpcomingAppointments([
          {
            id: '1',
            doctorName: 'Dr. Sarah Johnson',
            specialty: 'Cardiologist',
            date: '2024-11-20',
            time: '10:00 AM',
            avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
            status: 'scheduled',
          },
          {
            id: '2',
            doctorName: 'Dr. Michael Chen',
            specialty: 'Dermatologist',
            date: '2024-11-22',
            time: '2:30 PM',
            avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
            status: 'scheduled',
          },
        ]);
      }
    };

    fetchAppointments();
  }, []);

  // Fetch top specialists from Firebase
  useEffect(() => {
    const fetchTopSpecialists = async () => {
      try {
        const doctorsRef = collection(db, 'doctors');
        const q = query(
          doctorsRef,
          orderBy('rating', 'desc'),
          limit(3)
        );

        const querySnapshot = await getDocs(q);
        const doctorsData: Doctor[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          doctorsData.push({
            id: doc.id,
            name: data.name || 'Dr. Unknown',
            specialty: data.specialization || 'Specialist',
            rating: data.rating || 4.5,
            avatar: data.imageUrl || 'https://randomuser.me/api/portraits/women/33.jpg',
            experience: data.experience || 5,
          });
        });

        if (doctorsData.length > 0) {
          setTopSpecialists(doctorsData);
        } else {
          // Fallback to dummy data if no doctors found
          setTopSpecialists([
            {
              id: '1',
              name: 'Dr. Emily Wilson',
              specialty: 'Neurologist',
              rating: 4.9,
              avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
            },
            {
              id: '2',
              name: 'Dr. James Rodriguez',
              specialty: 'Orthopedic',
              rating: 4.8,
              avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
            },
            {
              id: '3',
              name: 'Dr. Aisha Patel',
              specialty: 'Pediatrician',
              rating: 4.9,
              avatar: 'https://randomuser.me/api/portraits/women/62.jpg',
            },
          ]);
        }
      } catch (error) {
        console.error('Error fetching top specialists:', error);
        // Fallback to dummy data in case of error
        setTopSpecialists([
          {
            id: '1',
            name: 'Dr. Emily Wilson',
            specialty: 'Neurologist',
            rating: 4.9,
            avatar: 'https://randomuser.me/api/portraits/women/33.jpg',
          },
          {
            id: '2',
            name: 'Dr. James Rodriguez',
            specialty: 'Orthopedic',
            rating: 4.8,
            avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
          },
          {
            id: '3',
            name: 'Dr. Aisha Patel',
            specialty: 'Pediatrician',
            rating: 4.9,
            avatar: 'https://randomuser.me/api/portraits/women/62.jpg',
          },
        ]);
      }
    };

    fetchTopSpecialists();
  }, []);

  // Medical categories
  const categories = [
    { id: '1', name: 'Cardiology', icon: 'heart-pulse' },
    { id: '2', name: 'Dentistry', icon: 'tooth' },
    { id: '3', name: 'Neurology', icon: 'brain' },
    { id: '4', name: 'Orthopedic', icon: 'bone' },
    { id: '5', name: 'Pediatric', icon: 'baby-face' },
    { id: '6', name: 'More', icon: 'dots-horizontal' },
  ];

  // Health tips
  const healthTips = [
    { id: '1', title: 'Stay Hydrated', content: 'Drink at least 8 glasses of water daily' },
    { id: '2', title: 'Regular Exercise', content: '30 minutes of moderate activity 5 days a week' },
    { id: '3', title: 'Sleep Well', content: 'Aim for 7-8 hours of quality sleep each night' },
  ];

  const handleBookAppointment = () => {
    navigation.navigate('BookAppointment');
  };

  const handleFindDoctor = () => {
    navigation.navigate('Doctors');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header Section */}
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerContent}>
          <View>
            <Text variant="titleMedium" style={styles.greeting}>Hello,</Text>
            <Text variant="headlineSmall" style={styles.userName}>{userName}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
            <Avatar.Image 
              size={50} 
              source={{ uri: auth.currentUser?.photoURL || 'https://randomuser.me/api/portraits/men/22.jpg' }} 
            />
          </TouchableOpacity>
        </View>
      </Surface>

      {/* Search Section */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search doctors, specialties..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {/* Categories */}
      <Surface style={styles.categoriesSection} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Medical Categories
        </Text>
        <View style={styles.categoriesGrid}>
          {categories.map(category => (
            <TouchableOpacity 
              key={category.id} 
              style={styles.categoryItem}
              onPress={() => handleFindDoctor()}
            >
              <Avatar.Icon 
                size={50} 
                icon={category.icon} 
                style={styles.categoryIcon} 
                color="#fff"
              />
              <Text variant="bodyMedium" style={styles.categoryText}>{category.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Surface>

      {/* Upcoming Appointments */}
      <Surface style={styles.appointmentsSection} elevation={1}>
        <View style={styles.sectionHeader}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Upcoming Appointments
          </Text>
          <Button mode="text" onPress={() => navigation.navigate('Appointments')}>See All</Button>
        </View>
        
        {upcomingAppointments.length > 0 ? upcomingAppointments.map(appointment => (
          <CardComponent key={appointment.id} style={styles.appointmentCard}>
            <View style={styles.appointmentHeader}>
              <Avatar.Image size={50} source={{ uri: appointment.avatar }} />
              <View style={styles.appointmentInfo}>
                <Text variant="titleMedium">{appointment.doctorName}</Text>
                <Text variant="bodyMedium" style={styles.specialtyText}>{appointment.specialty}</Text>
              </View>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.appointmentDetails}>
              <View style={styles.detailItem}>
                <IconButton icon="calendar" size={20} />
                <Text variant="bodyMedium">{appointment.date}</Text>
              </View>
              <View style={styles.detailItem}>
                <IconButton icon="clock-outline" size={20} />
                <Text variant="bodyMedium">{appointment.time}</Text>
              </View>
            </View>
            <View style={styles.buttonRow}>
              <Button 
                mode="outlined" 
                onPress={() => {}}
                style={styles.actionButton}
              >
                Reschedule
              </Button>
              <Button 
                mode="contained" 
                onPress={() => {}}
                style={styles.actionButton}
              >
                Details
              </Button>
            </View>
          </CardComponent>
        )) : (
          <View style={styles.emptyState}>
            <Text>No upcoming appointments</Text>
            <Button mode="contained" onPress={handleBookAppointment} style={styles.bookButton}>
              Book Now
            </Button>
          </View>
        )}
      </Surface>

      {/* Top Specialists */}
      <Surface style={styles.specialistsSection} elevation={1}>
        <View style={styles.sectionHeader}>
          <Text variant="titleMedium" style={styles.sectionTitle}>
            Top Specialists
          </Text>
          <Button mode="text" onPress={handleFindDoctor}>View All</Button>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.specialistsScroll}>
          {topSpecialists.map(doctor => (
            <Card key={doctor.id} style={styles.doctorCard} onPress={() => navigation.navigate('DoctorDetails', { doctorId: doctor.id })}>
              <Card.Cover source={{ uri: doctor.avatar }} style={styles.doctorImage} />
              <Card.Content style={styles.doctorCardContent}>
                <Text variant="titleMedium">{doctor.name}</Text>
                <Text variant="bodyMedium" style={styles.specialtyText}>{doctor.specialty}</Text>
                <View style={styles.ratingContainer}>
                  <IconButton icon="star" size={16} style={styles.starIcon} />
                  <Text variant="bodyMedium">{doctor.rating}</Text>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      </Surface>

      {/* Health Tips */}
      <Surface style={styles.tipsSection} elevation={1}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Health Tips
        </Text>
        {healthTips.map(tip => (
          <Card key={tip.id} style={styles.tipCard}>
            <Card.Content>
              <Text variant="titleMedium">{tip.title}</Text>
              <Text variant="bodyMedium">{tip.content}</Text>
            </Card.Content>
          </Card>
        ))}
      </Surface>

      {/* Quick Actions */}
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

      <View style={styles.footer} />
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
    backgroundColor: '#6200ee',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: '#ffffff',
    opacity: 0.8,
  },
  userName: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  searchContainer: {
    padding: 16,
    paddingTop: 10,
    paddingBottom: 5,
  },
  searchBar: {
    elevation: 2,
  },
  categoriesSection: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  categoryItem: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 16,
  },
  categoryIcon: {
    backgroundColor: '#6200ee',
    marginBottom: 8,
  },
  categoryText: {
    textAlign: 'center',
    fontSize: 12,
  },
  appointmentsSection: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontWeight: 'bold',
  },
  appointmentCard: {
    marginBottom: 16,
    padding: 8,
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
  specialtyText: {
    color: '#6200ee',
  },
  divider: {
    marginVertical: 8,
  },
  appointmentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 20,
  },
  bookButton: {
    marginTop: 10,
  },
  specialistsSection: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  specialistsScroll: {
    marginTop: 12,
  },
  doctorCard: {
    width: 160,
    marginRight: 16,
    overflow: 'hidden',
  },
  doctorImage: {
    height: 100,
  },
  doctorCardContent: {
    padding: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  starIcon: {
    margin: 0,
    padding: 0,
  },
  tipsSection: {
    margin: 16,
    marginTop: 8,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
  },
  tipCard: {
    marginTop: 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 8,
  },
  actionCard: {
    flex: 1,
    margin: 4,
  },
  buttonContainer: {
    marginTop: 12,
  },
  footer: {
    height: 20,
  },
});

export default HomeScreen; 