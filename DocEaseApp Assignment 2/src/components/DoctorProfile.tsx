import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Doctor } from '../types/doctor';
import { NavigationProp } from '../types/navigation';

interface DoctorProfileProps {
  doctor: Doctor;
}

export const DoctorProfile: React.FC<DoctorProfileProps> = ({ doctor }) => {
  const navigation = useNavigation<NavigationProp>();

  const handleBookAppointment = () => {
    navigation.navigate('BookAppointment', {
      doctor: {
        id: doctor.id,
        name: doctor.name,
        department: doctor.department,
      },
    });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Image
          source={{ uri: doctor.image }}
          style={styles.profileImage}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.name}>Dr. {doctor.name}</Text>
          <Text style={styles.department}>{doctor.department}</Text>
          <Text style={styles.experience}>{doctor.experience} years of experience</Text>
          <View style={styles.onlineStatus}>
            <View style={[styles.statusDot, { backgroundColor: doctor.online ? '#2ecc71' : '#95a5a6' }]} />
            <Text style={styles.statusText}>{doctor.online ? 'Online' : 'Offline'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Education</Text>
        <Text style={styles.sectionContent}>{doctor.education}</Text>
      </View>

      <TouchableOpacity 
        style={styles.bookButton}
        onPress={handleBookAppointment}
      >
        <Text style={styles.bookButtonText}>Book Appointment</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  profileHeader: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileInfo: {
    marginLeft: 20,
    justifyContent: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  department: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 4,
  },
  experience: {
    fontSize: 14,
    color: '#95a5a6',
    marginTop: 4,
  },
  onlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 16,
    color: '#34495e',
    lineHeight: 24,
  },
  bookButton: {
    backgroundColor: '#3498db',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 