import React, {useState, useCallback, useEffect, useLayoutEffect} from 'react';
import {View, StyleSheet, ScrollView, FlatList} from 'react-native';
import {
  Searchbar,
  Text,
  Button,
  Avatar,
  useTheme,
  IconButton,
  ActivityIndicator,
  Menu,
  Divider,
  Chip,
  Modal,
  Portal,
  RadioButton,
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
  
  // Header menu states
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [viewTypeMenuVisible, setViewTypeMenuVisible] = useState(false);
  const [viewType, setViewType] = useState<'grid' | 'list'>('list');
  
  // Filter states
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [availabilityFilter, setAvailabilityFilter] = useState<string | null>(null);
  const [feeRangeFilter, setFeeRangeFilter] = useState<string | null>(null);
  const [experienceFilter, setExperienceFilter] = useState<string | null>(null);
  
  // Sort state
  const [sortBy, setSortBy] = useState<string>('rating');

  const specialties = [
    'Cardiologist',
    'Dermatologist',
    'Pediatrician',
    'Neurologist',
    'Orthopedic',
  ];

  // Set up the header options
  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <IconButton
          icon="arrow-left"
          size={24}
          onPress={() => navigation.goBack()}
          style={{ marginLeft: -8 }}
        />
      ),
      headerRight: () => (
        <View style={styles.headerButtons}>
          <IconButton
            icon="filter-variant"
            size={24}
            onPress={() => setFilterModalVisible(true)}
          />
          <Menu
            visible={sortMenuVisible}
            onDismiss={() => setSortMenuVisible(false)}
            anchor={
              <IconButton
                icon="sort"
                size={24}
                onPress={() => setSortMenuVisible(true)}
              />
            }>
            <Menu.Item 
              onPress={() => {
                setSortBy('rating');
                setSortMenuVisible(false);
              }} 
              title="Rating (High to Low)" 
              leadingIcon="star"
              trailingIcon={sortBy === 'rating' ? 'check' : undefined}
            />
            <Menu.Item 
              onPress={() => {
                setSortBy('experience');
                setSortMenuVisible(false);
              }} 
              title="Experience (High to Low)" 
              leadingIcon="briefcase-outline"
              trailingIcon={sortBy === 'experience' ? 'check' : undefined}
            />
            <Menu.Item 
              onPress={() => {
                setSortBy('fees-low');
                setSortMenuVisible(false);
              }} 
              title="Fees (Low to High)" 
              leadingIcon="cash"
              trailingIcon={sortBy === 'fees-low' ? 'check' : undefined}
            />
            <Menu.Item 
              onPress={() => {
                setSortBy('fees-high');
                setSortMenuVisible(false);
              }} 
              title="Fees (High to Low)" 
              leadingIcon="cash-multiple"
              trailingIcon={sortBy === 'fees-high' ? 'check' : undefined}
            />
          </Menu>
          <Menu
            visible={viewTypeMenuVisible}
            onDismiss={() => setViewTypeMenuVisible(false)}
            anchor={
              <IconButton
                icon={viewType === 'grid' ? 'view-grid' : 'view-list'}
                size={24}
                onPress={() => setViewTypeMenuVisible(true)}
              />
            }>
            <Menu.Item 
              onPress={() => {
                setViewType('list');
                setViewTypeMenuVisible(false);
              }} 
              title="List View" 
              leadingIcon="view-list"
              trailingIcon={viewType === 'list' ? 'check' : undefined}
            />
            <Menu.Item 
              onPress={() => {
                setViewType('grid');
                setViewTypeMenuVisible(false);
              }} 
              title="Grid View" 
              leadingIcon="view-grid"
              trailingIcon={viewType === 'grid' ? 'check' : undefined}
            />
          </Menu>
        </View>
      ),
    });
  }, [navigation, sortMenuVisible, viewTypeMenuVisible, sortBy, viewType]);

  // Filter and sort doctors
  useEffect(() => {
    setLoading(true);
    
    // Start with all doctors
    let filteredResults = [...MOCK_DOCTORS];
    
    // Apply specialty filter
    if (selectedSpecialty) {
      filteredResults = filteredResults.filter(
        doctor => doctor.specialization === selectedSpecialty
      );
    }
    
    // Apply availability filter
    if (availabilityFilter) {
      if (availabilityFilter === 'today') {
        filteredResults = filteredResults.filter(
          doctor => doctor.availability?.includes('Available Today')
        );
      } else if (availabilityFilter === 'tomorrow') {
        filteredResults = filteredResults.filter(
          doctor => doctor.availability?.includes('Tomorrow')
        );
      }
    }
    
    // Apply experience filter
    if (experienceFilter) {
      if (experienceFilter === '0-5') {
        filteredResults = filteredResults.filter(
          doctor => (doctor.experience || 0) <= 5
        );
      } else if (experienceFilter === '5-10') {
        filteredResults = filteredResults.filter(
          doctor => (doctor.experience || 0) > 5 && (doctor.experience || 0) <= 10
        );
      } else if (experienceFilter === '10+') {
        filteredResults = filteredResults.filter(
          doctor => (doctor.experience || 0) > 10
        );
      }
    }
    
    // Apply fee range filter
    if (feeRangeFilter) {
      if (feeRangeFilter === '0-100') {
        filteredResults = filteredResults.filter(
          doctor => (doctor.fees || 0) <= 100
        );
      } else if (feeRangeFilter === '100-150') {
        filteredResults = filteredResults.filter(
          doctor => (doctor.fees || 0) > 100 && (doctor.fees || 0) <= 150
        );
      } else if (feeRangeFilter === '150+') {
        filteredResults = filteredResults.filter(
          doctor => (doctor.fees || 0) > 150
        );
      }
    }
    
    // Apply sorting
    if (sortBy === 'rating') {
      filteredResults.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'experience') {
      filteredResults.sort((a, b) => (b.experience || 0) - (a.experience || 0));
    } else if (sortBy === 'fees-low') {
      filteredResults.sort((a, b) => (a.fees || 0) - (b.fees || 0));
    } else if (sortBy === 'fees-high') {
      filteredResults.sort((a, b) => (b.fees || 0) - (a.fees || 0));
    }
    
    // Simulate loading delay
    const timer = setTimeout(() => {
      setDoctors(filteredResults);
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [selectedSpecialty, sortBy, availabilityFilter, experienceFilter, feeRangeFilter]);

  const handleSpecialtySelect = useCallback((specialty: string) => {
    setSelectedSpecialty(selectedSpecialty === specialty ? null : specialty);
  }, [selectedSpecialty]);

  const filteredDoctors = doctors.filter(doctor => {
    if (!doctor || !doctor.name) return false;
    return doctor.name.toLowerCase().includes((searchQuery || '').toLowerCase());
  });

  const clearAllFilters = () => {
    setAvailabilityFilter(null);
    setFeeRangeFilter(null);
    setExperienceFilter(null);
    setSelectedSpecialty(null);
  };

  const renderDoctorCard = ({item}: {item: DoctorListItem}) => {
    if (!item) return null;
    
    return (
      <CardComponent style={[styles.doctorCard, viewType === 'grid' && styles.gridCard]}>
        <View style={styles.doctorHeader}>
          <Avatar.Image 
            size={viewType === 'grid' ? 40 : 50} 
            source={{ 
              uri: item.imageUrl || item.image || 
                   `https://randomuser.me/api/portraits/${item.name.includes('Dr. Emily') ? 'women/33' : 'men/32'}.jpg` 
            }} 
          />
          <View style={styles.doctorInfo}>
            <Text variant={viewType === 'grid' ? 'titleSmall' : 'titleMedium'} style={styles.doctorName}>
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
        
        {viewType === 'list' && (
          <>
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
            
            <View style={styles.hospitalContainer}>
              <IconButton
                icon="hospital-building"
                size={20}
                style={styles.hospitalIcon}
              />
              <Text variant="bodySmall" style={styles.hospitalText}>
                {item.hospital || 'General Hospital'}
              </Text>
            </View>
            
            <View style={styles.footer}>
              <View style={styles.feesContainer}>
                <Text variant="labelLarge" style={styles.feesLabel}>
                  Consultation
                </Text>
                <Text
                  variant="titleMedium"
                  style={[styles.feesText, {color: theme.colors.primary}]}>
                  ${item.fees || 100}
                </Text>
              </View>
              
              <Button
                mode="contained"
                onPress={() => navigation.navigate('DoctorDetails', {doctorId: item.id})}
                style={styles.viewProfileButton}>
                View Profile
              </Button>
            </View>
          </>
        )}
        
        {viewType === 'grid' && (
          <Button
            mode="outlined"
            onPress={() => navigation.navigate('DoctorDetails', {doctorId: item.id})}
            style={styles.gridButton}>
            View
          </Button>
        )}
      </CardComponent>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search doctors..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      <View style={styles.specialtiesContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {specialties.map(specialty => (
            <Chip
              key={specialty}
              selected={selectedSpecialty === specialty}
              onPress={() => handleSpecialtySelect(specialty)}
              style={styles.specialtyChip}
              showSelectedCheck={true}>
              {specialty}
            </Chip>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Finding the best doctors...</Text>
        </View>
      ) : (
        <>
          <View style={styles.resultsHeader}>
            <Text variant="titleMedium">
              {filteredDoctors.length} {filteredDoctors.length === 1 ? 'Doctor' : 'Doctors'} Found
            </Text>
            {(availabilityFilter || feeRangeFilter || experienceFilter || selectedSpecialty) && (
              <Button
                mode="text"
                onPress={clearAllFilters}
                style={styles.clearFiltersButton}>
                Clear All
              </Button>
            )}
          </View>
          
          <FlatList
            data={filteredDoctors}
            renderItem={renderDoctorCard}
            keyExtractor={item => item.id}
            contentContainerStyle={[styles.listContainer, viewType === 'grid' && styles.gridContainer]}
            numColumns={viewType === 'grid' ? 2 : 1}
            key={viewType} // Force re-render when view type changes
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <IconButton icon="doctor" size={50} />
                <Text style={styles.emptyText}>
                  No doctors found matching your criteria.
                </Text>
                <Button
                  mode="outlined"
                  onPress={clearAllFilters}
                  style={styles.clearFiltersButton}>
                  Clear Filters
                </Button>
              </View>
            )}
          />
        </>
      )}
      
      <Portal>
        <Modal 
          visible={filterModalVisible} 
          onDismiss={() => setFilterModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text variant="headlineSmall" style={styles.modalTitle}>Filter Doctors</Text>
          <Divider style={styles.modalDivider} />
          
          <Text variant="titleMedium" style={styles.filterSectionTitle}>Availability</Text>
          <View style={styles.radioGroup}>
            <RadioButton.Group 
              onValueChange={value => setAvailabilityFilter(value || null)} 
              value={availabilityFilter || ''}
            >
              <RadioButton.Item label="All" value="" />
              <RadioButton.Item label="Available Today" value="today" />
              <RadioButton.Item label="Available Tomorrow" value="tomorrow" />
            </RadioButton.Group>
          </View>
          
          <Text variant="titleMedium" style={styles.filterSectionTitle}>Experience</Text>
          <View style={styles.radioGroup}>
            <RadioButton.Group 
              onValueChange={value => setExperienceFilter(value || null)} 
              value={experienceFilter || ''}
            >
              <RadioButton.Item label="All" value="" />
              <RadioButton.Item label="0-5 years" value="0-5" />
              <RadioButton.Item label="5-10 years" value="5-10" />
              <RadioButton.Item label="10+ years" value="10+" />
            </RadioButton.Group>
          </View>
          
          <Text variant="titleMedium" style={styles.filterSectionTitle}>Consultation Fee</Text>
          <View style={styles.radioGroup}>
            <RadioButton.Group 
              onValueChange={value => setFeeRangeFilter(value || null)} 
              value={feeRangeFilter || ''}
            >
              <RadioButton.Item label="All" value="" />
              <RadioButton.Item label="$0-$100" value="0-100" />
              <RadioButton.Item label="$100-$150" value="100-150" />
              <RadioButton.Item label="$150+" value="150+" />
            </RadioButton.Group>
          </View>
          
          <View style={styles.modalButtons}>
            <Button 
              mode="outlined" 
              onPress={() => {
                clearAllFilters();
                setFilterModalVisible(false);
              }}
              style={styles.modalButton}
            >
              Clear All
            </Button>
            <Button 
              mode="contained" 
              onPress={() => setFilterModalVisible(false)}
              style={styles.modalButton}
            >
              Apply Filters
            </Button>
          </View>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerButtons: {
    flexDirection: 'row',
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fff',
  },
  searchBar: {
    elevation: 0,
  },
  specialtiesContainer: {
    padding: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  specialtyChip: {
    margin: 4,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  clearFiltersButton: {
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  listContainer: {
    padding: 8,
  },
  gridContainer: {
    flexDirection: 'column',
  },
  doctorCard: {
    margin: 8,
    padding: 16,
  },
  gridCard: {
    width: '46%',
    padding: 8,
  },
  doctorHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  doctorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  doctorName: {
    fontWeight: 'bold',
  },
  specialtyText: {
    color: '#666',
  },
  experienceText: {
    color: '#888',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontWeight: 'bold',
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  availabilityIcon: {
    margin: 0,
    padding: 0,
  },
  availabilityText: {
    flex: 1,
  },
  hospitalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  hospitalIcon: {
    margin: 0,
    padding: 0,
  },
  hospitalText: {
    flex: 1,
    color: '#666',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  feesContainer: {
    flex: 1,
  },
  feesLabel: {
    color: '#666',
  },
  feesText: {
    fontWeight: 'bold',
  },
  viewProfileButton: {
    marginLeft: 16,
  },
  gridButton: {
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    marginVertical: 16,
    textAlign: 'center',
    color: '#666',
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 8,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalDivider: {
    marginVertical: 16,
  },
  filterSectionTitle: {
    marginVertical: 8,
  },
  radioGroup: {
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default DoctorListScreen; 