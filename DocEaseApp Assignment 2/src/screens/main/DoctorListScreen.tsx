import React, {useState, useCallback, useEffect} from 'react';
import {View, StyleSheet, ScrollView, FlatList, ActivityIndicator} from 'react-native';
import {
  Searchbar,
  Text,
  Button,
  Avatar,
  useTheme,
  Surface,
  IconButton,
  Chip,
  Card,
} from 'react-native-paper';
import { Doctor } from '../../types/AppointmentTypes';
import { appointmentService } from '../../utils/appointmentService';

interface DoctorListScreenProps {
  navigation: any;
}

const DoctorListScreen: React.FC<DoctorListScreenProps> = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  // Fetch doctors on component mount
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const fetchedDoctors = await appointmentService.getDoctors();
        
        // If no doctors are found, add mock doctors for development
        if (fetchedDoctors.length === 0) {
          await appointmentService.addMockDoctors();
          const mockedDoctors = await appointmentService.getDoctors();
          setDoctors(mockedDoctors);
        } else {
          setDoctors(fetchedDoctors);
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError('Failed to load doctors. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  // Extract unique specialties from the doctors array
  const specialties = [...new Set(doctors.map(doctor => doctor.specialty))];

  const handleSpecialtySelect = useCallback((specialty: string) => {
    setSelectedSpecialty(selectedSpecialty === specialty ? null : specialty);
  }, [selectedSpecialty]);

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesSpecialty =
      !selectedSpecialty || doctor.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const renderDoctorCard = ({item}: {item: Doctor}) => (
    <Card style={styles.doctorCard} mode="elevated">
      <Card.Content>
        <View style={styles.doctorHeader}>
          {item.profileImage ? (
            <Avatar.Image 
              size={64} 
              source={{uri: item.profileImage}} 
            />
          ) : (
            <Avatar.Icon size={64} icon="doctor" color="#fff" style={{backgroundColor: theme.colors.primary}} />
          )}
          
          <View style={styles.doctorInfo}>
            <Text variant="titleMedium" style={styles.doctorName}>
              {item.name}
            </Text>
            <Text variant="bodyMedium" style={styles.specialtyText}>
              {item.specialty}
            </Text>
            {item.experience && (
              <Text variant="bodySmall" style={styles.experienceText}>
                {item.experience} experience
              </Text>
            )}
            {item.qualifications && (
              <Text variant="bodySmall" style={styles.qualificationsText}>
                {item.qualifications}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.ratingRow}>
          {item.rating && (
            <View style={styles.ratingContainer}>
              <IconButton icon="star" size={18} iconColor={theme.colors.primary} style={styles.starIcon} />
              <Text variant="titleSmall" style={styles.ratingText}>
                {item.rating.toFixed(1)}
              </Text>
              {item.reviewCount && (
                <Text variant="bodySmall" style={styles.reviewCountText}>
                  ({item.reviewCount} reviews)
                </Text>
              )}
            </View>
          )}
          
          {item.fee && (
            <Chip icon="currency-usd" style={styles.feeChip}>
              {item.fee}/session
            </Chip>
          )}
        </View>
        
        {item.clinicAddress && (
          <View style={styles.addressContainer}>
            <IconButton icon="map-marker" size={18} iconColor="#666" style={styles.addressIcon} />
            <Text variant="bodySmall" style={styles.addressText}>
              {item.clinicAddress}
            </Text>
          </View>
        )}
      </Card.Content>
      
      <Card.Actions style={styles.cardActions}>
        <Button
          mode="outlined"
          onPress={() => navigation.navigate('DoctorDetails', {doctorId: item.id})}
          style={styles.actionButton}>
          View Profile
        </Button>
        <Button
          mode="contained"
          onPress={() => navigation.navigate('BookAppointment', {doctorId: item.id})}
          style={styles.actionButton}>
          Book Now
        </Button>
      </Card.Actions>
    </Card>
  );

  const renderSpecialtyItem = useCallback(
    (specialty: string) => (
      <Chip
        key={specialty}
        selected={selectedSpecialty === specialty}
        showSelectedOverlay
        onPress={() => handleSpecialtySelect(specialty)}
        style={styles.specialtyChip}
        mode={selectedSpecialty === specialty ? 'flat' : 'outlined'}>
        {specialty}
      </Chip>
    ),
    [selectedSpecialty, handleSpecialtySelect],
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading doctors...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <IconButton icon="alert-circle" size={48} iconColor={theme.colors.error} />
        <Text style={styles.errorText}>{error}</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={styles.errorButton}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <Text variant="headlineSmall" style={styles.screenTitle}>Find Doctors</Text>
        <Searchbar
          placeholder="Search by name or specialty"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.specialtyContainer}>
          {specialties.map(renderSpecialtyItem)}
        </ScrollView>
      </Surface>

      {filteredDoctors.length > 0 ? (
        <FlatList
          data={filteredDoctors}
          renderItem={renderDoctorCard}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <IconButton icon="doctor" size={64} iconColor={theme.colors.primary} />
          <Text variant="titleMedium" style={styles.emptyText}>No doctors found</Text>
          <Text variant="bodyMedium" style={styles.emptySubText}>
            Try adjusting your search or filters
          </Text>
        </View>
      )}
    </View>
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
  },
  emptySubText: {
    marginTop: 8,
    color: '#666',
    textAlign: 'center',
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  screenTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  searchBar: {
    marginBottom: 16,
    elevation: 0,
    backgroundColor: '#f0f0f0',
  },
  specialtyContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  specialtyChip: {
    marginRight: 8,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  doctorCard: {
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  doctorHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  doctorInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  doctorName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  specialtyText: {
    marginBottom: 4,
    color: '#333',
  },
  experienceText: {
    color: '#666',
  },
  qualificationsText: {
    color: '#666',
    fontStyle: 'italic',
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    margin: 0,
    marginRight: -8,
  },
  ratingText: {
    fontWeight: 'bold',
  },
  reviewCountText: {
    color: '#666',
    marginLeft: 4,
  },
  feeChip: {
    height: 30,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addressIcon: {
    margin: 0,
  },
  addressText: {
    flex: 1,
    color: '#666',
  },
  cardActions: {
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionButton: {
    marginLeft: 8,
  },
});

export default DoctorListScreen; 