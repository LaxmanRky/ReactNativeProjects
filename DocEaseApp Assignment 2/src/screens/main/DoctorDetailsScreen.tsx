import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import {
  Avatar,
  Text,
  Button,
  Card,
  Divider,
  IconButton,
  Chip,
  useTheme,
  Surface,
} from 'react-native-paper';
import { Doctor } from '../../types/AppointmentTypes';
import { appointmentService } from '../../utils/appointmentService';

interface DoctorDetailsScreenProps {
  navigation: any;
  route: any;
}

const DoctorDetailsScreen: React.FC<DoctorDetailsScreenProps> = ({
  navigation,
  route,
}) => {
  const { doctorId } = route.params;
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  // Fetch doctor details
  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        setLoading(true);
        const doctorData = await appointmentService.getDoctorById(doctorId);
        setDoctor(doctorData);
      } catch (err) {
        console.error('Error fetching doctor details:', err);
        setError('Failed to load doctor information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchDoctorDetails();
    } else {
      setError('Doctor ID is missing');
      setLoading(false);
    }
  }, [doctorId]);

  const handleBookAppointment = () => {
    navigation.navigate('BookAppointment', { doctorId });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading doctor information...</Text>
      </View>
    );
  }

  if (error || !doctor) {
    return (
      <View style={styles.errorContainer}>
        <IconButton icon="alert-circle" size={48} iconColor={theme.colors.error} />
        <Text style={styles.errorText}>{error || 'Doctor not found'}</Text>
        <Button mode="contained" onPress={() => navigation.goBack()} style={styles.errorButton}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Doctor Header */}
      <Surface style={styles.headerContainer} elevation={2}>
        <View style={styles.profileHeader}>
          {doctor.profileImage ? (
            <Avatar.Image
              size={100}
              source={{ uri: doctor.profileImage }}
              style={styles.avatar}
            />
          ) : (
            <Avatar.Icon
              size={100}
              icon="doctor"
              color="#fff"
              style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
            />
          )}

          <View style={styles.doctorInfo}>
            <Text variant="headlineSmall" style={styles.doctorName}>
              {doctor.name}
            </Text>
            <Text variant="titleMedium" style={styles.specialtyText}>
              {doctor.specialty}
            </Text>
            
            {doctor.qualifications && (
              <Chip icon="school" style={styles.qualificationChip}>
                {doctor.qualifications}
              </Chip>
            )}
            
            <View style={styles.ratingContainer}>
              <IconButton
                icon="star"
                size={20}
                iconColor={theme.colors.primary}
                style={styles.ratingIcon}
              />
              <Text variant="bodyLarge" style={styles.ratingText}>
                {doctor.rating?.toFixed(1) || '0.0'}
              </Text>
              <Text variant="bodyMedium" style={styles.reviewText}>
                ({doctor.reviewCount || 0} reviews)
              </Text>
            </View>
          </View>
        </View>

        <Button
          mode="contained"
          icon="calendar-check"
          onPress={handleBookAppointment}
          style={styles.bookButton}>
          Book Appointment
        </Button>
      </Surface>

      {/* Doctor Details */}
      <Card style={styles.detailsCard}>
        <Card.Content>
          <View style={styles.detailSection}>
            <View style={styles.detailHeader}>
              <IconButton icon="account-details" size={24} />
              <Text variant="titleMedium">About</Text>
            </View>
            <Text variant="bodyMedium" style={styles.aboutText}>
              {doctor.experience ? `${doctor.experience} of experience as a ${doctor.specialty}.` : ''}
              {'\n\n'}
              {doctor.qualifications ? `Qualifications: ${doctor.qualifications}` : ''}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.detailSection}>
            <View style={styles.detailHeader}>
              <IconButton icon="map-marker" size={24} />
              <Text variant="titleMedium">Location</Text>
            </View>
            <Text variant="bodyMedium" style={styles.locationText}>
              {doctor.clinicAddress || 'Address not available'}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.detailSection}>
            <View style={styles.detailHeader}>
              <IconButton icon="currency-usd" size={24} />
              <Text variant="titleMedium">Consultation Fee</Text>
            </View>
            <Text variant="headlineSmall" style={styles.feeText}>
              ${doctor.fee || 'N/A'}
            </Text>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.detailSection}>
            <View style={styles.detailHeader}>
              <IconButton icon="calendar" size={24} />
              <Text variant="titleMedium">Availability</Text>
            </View>
            {doctor.availability && doctor.availability.length > 0 ? (
              <View style={styles.availabilityContainer}>
                {doctor.availability.map((item, index) => (
                  <View key={index} style={styles.availabilityItem}>
                    <Text variant="titleSmall" style={styles.dayText}>
                      {item.day}:
                    </Text>
                    <View style={styles.slotsContainer}>
                      {item.slots.slice(0, 3).map((slot, slotIndex) => (
                        <Chip
                          key={slotIndex}
                          style={styles.slotChip}
                          mode="outlined"
                          disabled={slot.isBooked}>
                          {`${slot.startTime} - ${slot.endTime}`}
                        </Chip>
                      ))}
                      {item.slots.length > 3 && (
                        <Text variant="bodySmall" style={styles.moreSlotsText}>
                          +{item.slots.length - 3} more slots
                        </Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text variant="bodyMedium" style={styles.noAvailabilityText}>
                No availability information
              </Text>
            )}
          </View>
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        icon="calendar-check"
        onPress={handleBookAppointment}
        style={styles.bottomBookButton}
        contentStyle={styles.bookButtonContent}>
        Book Appointment
      </Button>
    </ScrollView>
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
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    marginVertical: 16,
    textAlign: 'center',
  },
  errorButton: {
    marginTop: 16,
  },
  headerContainer: {
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatar: {
    marginRight: 16,
  },
  doctorInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  doctorName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  specialtyText: {
    marginBottom: 8,
    color: '#333',
  },
  qualificationChip: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingIcon: {
    margin: 0,
    marginRight: -4,
  },
  ratingText: {
    fontWeight: 'bold',
    marginRight: 4,
  },
  reviewText: {
    color: '#666',
  },
  bookButton: {
    marginTop: 8,
  },
  detailsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
  },
  detailSection: {
    marginVertical: 8,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 16,
  },
  aboutText: {
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  locationText: {
    paddingHorizontal: 8,
  },
  feeText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  availabilityContainer: {
    paddingHorizontal: 8,
  },
  availabilityItem: {
    marginBottom: 12,
  },
  dayText: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  slotChip: {
    margin: 4,
  },
  moreSlotsText: {
    margin: 8,
    color: '#666',
  },
  noAvailabilityText: {
    fontStyle: 'italic',
    color: '#666',
    paddingHorizontal: 8,
  },
  bottomBookButton: {
    marginHorizontal: 16,
    marginBottom: 24,
    marginTop: 8,
  },
  bookButtonContent: {
    paddingVertical: 8,
  },
});

export default DoctorDetailsScreen; 