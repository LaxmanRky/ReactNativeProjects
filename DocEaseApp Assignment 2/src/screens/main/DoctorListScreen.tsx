import React, {useState, useCallback, useEffect} from 'react';
import {View, StyleSheet, ScrollView, FlatList, TouchableOpacity} from 'react-native';
import {
  Searchbar,
  Text,
  Button,
  Avatar,
  useTheme,
  Surface,
  IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import CardComponent from '../../components/CardComponent';
import { Doctor } from '../../types/doctor';

interface DoctorListScreenProps {
  navigation: any;
}

// Enhanced doctor type for the doctor list
interface DoctorListItem extends Doctor {
  rating?: number;
  availability?: string;
  imageUrl?: string;
  hospital?: string;
  fees?: number;
  specialization?: string; // Alias for department to maintain compatibility
}

// Mock data for doctors
const MOCK_DOCTORS: DoctorListItem[] = [
  {
    id: '1',
    name: 'Dr. Sarah Johnson',
    department: 'Cardiology',
    specialization: 'Cardiologist',
    experience: 15,
    rating: 4.8,
    availability: 'Available Today',
    hospital: 'City Medical Center',
    fees: 120,
    education: 'MD, Cardiology, Harvard Medical School',
    image: 'https://randomuser.me/api/portraits/women/33.jpg',
    imageUrl: 'https://randomuser.me/api/portraits/women/33.jpg',
    online: true
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    department: 'Dermatology',
    specialization: 'Dermatologist',
    experience: 10,
    rating: 4.7,
    availability: 'Next Available: Tomorrow',
    hospital: 'Dermatology Clinic',
    fees: 150,
    education: 'MD, Dermatology, Johns Hopkins University',
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    imageUrl: 'https://randomuser.me/api/portraits/men/32.jpg',
    online: true
  },
  {
    id: '3',
    name: 'Dr. Emily Williams',
    department: 'Pediatrics',
    specialization: 'Pediatrician',
    experience: 12,
    rating: 4.9,
    availability: 'Available Today',
    hospital: 'Children\'s Hospital',
    fees: 100,
    education: 'MD, Pediatrics, Stanford University',
    image: 'https://randomuser.me/api/portraits/women/32.jpg',
    imageUrl: 'https://randomuser.me/api/portraits/women/32.jpg',
    online: false
  },
  {
    id: '4',
    name: 'Dr. David Rodriguez',
    department: 'Neurology',
    specialization: 'Neurologist',
    experience: 18,
    rating: 4.6,
    availability: 'Available Today',
    hospital: 'Neurology Center',
    fees: 200,
    education: 'MD, Neurology, Yale University',
    image: 'https://randomuser.me/api/portraits/men/45.jpg',
    imageUrl: 'https://randomuser.me/api/portraits/men/45.jpg',
    online: true
  },
  {
    id: '5',
    name: 'Dr. Jennifer Martinez',
    department: 'Orthopedics',
    specialization: 'Orthopedic',
    experience: 14,
    rating: 4.5,
    availability: 'Next Available: Tomorrow',
    hospital: 'Orthopedic Specialists',
    fees: 180,
    education: 'MD, Orthopedic Surgery, Johns Hopkins University',
    image: 'https://randomuser.me/api/portraits/women/45.jpg',
    imageUrl: 'https://randomuser.me/api/portraits/women/45.jpg',
    online: true
  }
];

const DoctorListScreen: React.FC<DoctorListScreenProps> = ({navigation}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<DoctorListItem[]>(MOCK_DOCTORS);
  const [loading, setLoading] = useState(false);
  const theme = useTheme();

  const specialties = [
    'Cardiologist',
    'Dermatologist',
    'Pediatrician',
    'Neurologist',
    'Orthopedic',
  ];

  // Filter doctors based on specialty when selected
  useEffect(() => {
    setLoading(true);
    
    // Simulate loading delay
    const timer = setTimeout(() => {
      if (selectedSpecialty) {
        const filtered = MOCK_DOCTORS.filter(
          doctor => doctor.specialization === selectedSpecialty
        );
        setDoctors(filtered);
      } else {
        setDoctors(MOCK_DOCTORS);
      }
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [selectedSpecialty]);

  const handleSpecialtySelect = useCallback((specialty: string) => {
    setSelectedSpecialty(selectedSpecialty === specialty ? null : specialty);
  }, [selectedSpecialty]);

  const filteredDoctors = doctors.filter(doctor => {
    if (!doctor || !doctor.name) return false;
    return doctor.name.toLowerCase().includes((searchQuery || '').toLowerCase());
  });

  const renderDoctorCard = ({item}: {item: DoctorListItem}) => {
    if (!item) return null;
    
    return (
      <CardComponent style={styles.doctorCard}>
        <View style={styles.doctorHeader}>
          <Avatar.Image 
            size={50} 
            source={{ 
              uri: item.imageUrl || item.image || 
                   `https://randomuser.me/api/portraits/${item.name.includes('Dr. Emily') ? 'women/33' : 'men/32'}.jpg` 
            }} 
          />
          <View style={styles.doctorInfo}>
            <Text variant="titleMedium" style={styles.doctorName}>
              {item.name || 'Unknown Doctor'}
            </Text>
            <Text variant="bodyMedium" style={styles.specialtyText}>
              {item.specialization || item.department || 'Specialist'}
            </Text>
            <Text variant="bodySmall" style={styles.experienceText}>
              {item.experience || 0} years experience
            </Text>
          </View>
          <View style={styles.ratingContainer}>
            <Text variant="titleSmall" style={styles.ratingText}>
              {item.rating || '4.0'}
            </Text>
            <IconButton icon="star" size={16} />
          </View>
        </View>
        <View style={styles.availabilityContainer}>
          <IconButton
            icon="clock-outline"
            size={20}
            style={styles.availabilityIcon}
          />
          <Text
            variant="bodySmall"
            style={[
              styles.availabilityText,
              {
                color: (item.availability || '').includes('Available Today')
                  ? theme.colors.primary
                  : theme.colors.secondary,
              },
            ]}>
            {item.availability || 'Check Availability'}
          </Text>
        </View>
        <View style={styles.cardActions}>
          <Button
            mode="contained"
            onPress={() => navigation.navigate('DoctorDetails', {doctorId: item.id})}
            style={styles.actionButton}>
            View Profile
          </Button>
        </View>
      </CardComponent>
    );
  };

  const renderSpecialtyItem = useCallback(
    (specialty: string) => (
      <TouchableOpacity
        key={specialty}
        style={[
          styles.specialtyItem,
          selectedSpecialty === specialty && {
            backgroundColor: theme.colors.primaryContainer,
          },
        ]}
        onPress={() => handleSpecialtySelect(specialty)}>
        <Text
          style={[
            styles.specialtyText,
            selectedSpecialty === specialty && {
              color: theme.colors.primary,
            },
          ]}>
          {specialty}
        </Text>
      </TouchableOpacity>
    ),
    [selectedSpecialty, theme.colors, handleSpecialtySelect],
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <Searchbar
          placeholder="Search doctors"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.specialtyContainer}>
          {specialties.map(renderSpecialtyItem)}
        </ScrollView>
      </Surface>

      <FlatList
        data={filteredDoctors}
        renderItem={renderDoctorCard}
        keyExtractor={item => item?.id || `fallback-${Math.random()}`}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text>No doctors found</Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  searchBar: {
    marginBottom: 12,
    elevation: 0,
  },
  specialtyContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  specialtyItem: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f0f0f0',
  },
  specialtyText: {
    fontSize: 14,
    fontWeight: '500',
  },
  listContainer: {
    padding: 16,
  },
  doctorCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  doctorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  doctorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  doctorName: {
    fontWeight: '600',
  },
  experienceText: {
    marginTop: 4,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontWeight: '600',
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  availabilityIcon: {
    margin: 0,
    padding: 0,
  },
  availabilityText: {
    marginLeft: 4,
    fontWeight: '500',
  },
  cardActions: {
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  actionButton: {
    marginLeft: 8,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default DoctorListScreen; 