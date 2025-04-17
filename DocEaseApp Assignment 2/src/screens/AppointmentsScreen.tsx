import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, RefreshControl, Alert } from 'react-native';
import { 
  Text, 
  Card, 
  Button, 
  ActivityIndicator, 
  Chip, 
  Divider, 
  Searchbar,
  IconButton,
  useTheme,
  FAB,
  Portal,
  Modal
} from 'react-native-paper';
import { auth, db } from '../firebase/config';
import { AppointmentData } from '../utils/userDataStorage';
import { useNavigation } from '@react-navigation/native';
import { NavigationProp } from '../types/navigation';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

export const AppointmentsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const theme = useTheme();
  const [appointments, setAppointments] = useState<AppointmentData[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<AppointmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  
  // Reschedule state
  const [rescheduleModalVisible, setRescheduleModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentData | null>(null);
  const [newDate, setNewDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [newTimeSlot, setNewTimeSlot] = useState('');
  const [timeSlots] = useState([
    '9:00 AM', '9:30 AM', '10:00 AM', '10:30 AM', 
    '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
    '2:00 PM', '2:30 PM', '3:00 PM', '3:30 PM',
    '4:00 PM', '4:30 PM'
  ]);

  useEffect(() => {
    fetchAppointments();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = appointments.filter(appointment => 
        appointment.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.department.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredAppointments(filtered);
    } else if (activeFilter) {
      const filtered = appointments.filter(appointment => 
        appointment.status === activeFilter
      );
      setFilteredAppointments(filtered);
    } else {
      setFilteredAppointments(appointments);
    }
  }, [searchQuery, appointments, activeFilter]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const appointmentsRef = db.collection('users').doc(currentUser.uid).collection('appointments');
      const snapshot = await appointmentsRef.orderBy('appointmentDate', 'desc').get();
      
      const userAppointments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AppointmentData[];
      
      setAppointments(userAppointments);
      setFilteredAppointments(userAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      Alert.alert('Error', 'Failed to load appointments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAppointments();
  };

  const cancelAppointment = async (appointmentId: string) => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const appointmentRef = db.collection('users').doc(currentUser.uid)
        .collection('appointments').doc(appointmentId);
      
      await appointmentRef.update({
        status: 'cancelled',
        cancelledAt: new Date().toISOString()
      });

      // Also update in global appointments
      const globalAppointmentsRef = db.collection('appointments');
      const querySnapshot = await globalAppointmentsRef.where('appointmentId', '==', appointmentId).get();
      
      if (!querySnapshot.empty) {
        const globalAppointmentDoc = querySnapshot.docs[0];
        await globalAppointmentDoc.ref.update({
          status: 'cancelled',
          cancelledAt: new Date().toISOString()
        });
      }

      Alert.alert('Success', 'Appointment cancelled successfully');
      fetchAppointments(); // Refresh data
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      Alert.alert('Error', 'Failed to cancel appointment');
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'confirmed': return theme.colors.primary;
      case 'pending': return '#FFA000';
      case 'cancelled': return '#D32F2F';
      case 'completed': return '#388E3C';
      default: return theme.colors.primary;
    }
  };

  const applyFilter = (filter: string | null) => {
    setActiveFilter(filter);
    setFilterModalVisible(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setNewDate(selectedDate);
    }
  };

  const openRescheduleModal = (appointment: AppointmentData) => {
    setSelectedAppointment(appointment);
    // Set initial date from appointment's date string
    const appointmentDate = new Date(appointment.appointmentDate);
    setNewDate(appointmentDate);
    setNewTimeSlot(appointment.timeSlot);
    setRescheduleModalVisible(true);
  };

  const rescheduleAppointment = async () => {
    if (!selectedAppointment) return;
    
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }

      const appointmentId = selectedAppointment.id;
      if (!appointmentId) {
        throw new Error('Appointment ID not found');
      }

      const formattedDate = format(newDate, 'yyyy-MM-dd');
      
      const appointmentRef = db.collection('users').doc(currentUser.uid)
        .collection('appointments').doc(appointmentId);
      
      await appointmentRef.update({
        appointmentDate: formattedDate,
        timeSlot: newTimeSlot,
        status: 'pending',
        updatedAt: new Date().toISOString()
      });

      // Also update in global appointments
      const globalAppointmentsRef = db.collection('appointments');
      const querySnapshot = await globalAppointmentsRef.where('appointmentId', '==', appointmentId).get();
      
      if (!querySnapshot.empty) {
        const globalAppointmentDoc = querySnapshot.docs[0];
        await globalAppointmentDoc.ref.update({
          appointmentDate: formattedDate,
          timeSlot: newTimeSlot,
          status: 'pending',
          updatedAt: new Date().toISOString()
        });
      }

      Alert.alert('Success', 'Appointment rescheduled successfully');
      setRescheduleModalVisible(false);
      fetchAppointments(); // Refresh data
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      Alert.alert('Error', 'Failed to reschedule appointment');
    }
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No appointments found</Text>
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('Home')} 
        style={styles.bookButton}
      >
        Book an Appointment
      </Button>
    </View>
  );

  const renderItem = ({ item }: { item: AppointmentData }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text variant="titleLarge">{item.doctorName}</Text>
          <Chip 
            style={{ backgroundColor: getStatusColor(item.status) }}
            textStyle={{ color: 'white' }}
          >
            {item.status.toUpperCase()}
          </Chip>
        </View>
        
        <Text variant="titleMedium" style={styles.department}>{item.department}</Text>
        
        <Divider style={styles.divider} />
        
        <View style={styles.detailRow}>
          <IconButton icon="calendar" size={20} />
          <Text variant="bodyMedium">Date: {item.appointmentDate}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <IconButton icon="clock-outline" size={20} />
          <Text variant="bodyMedium">Time: {item.timeSlot}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <IconButton icon={item.online ? "video" : "hospital-building"} size={20} />
          <Text variant="bodyMedium">
            {item.online ? 'Online Consultation' : 'In-Person Visit'}
          </Text>
        </View>

        {item.reason && (
          <View style={styles.reasonContainer}>
            <Text variant="bodySmall" style={styles.reasonLabel}>Reason for visit:</Text>
            <Text variant="bodyMedium" style={styles.reasonText}>
              {item.reason}
            </Text>
          </View>
        )}
      </Card.Content>

      {item.status === 'pending' || item.status === 'confirmed' ? (
        <Card.Actions>
          <Button onPress={() => cancelAppointment(item.id || '')}>Cancel</Button>
          <Button mode="contained" onPress={() => openRescheduleModal(item)}>Reschedule</Button>
        </Card.Actions>
      ) : null}
    </Card>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text>Loading appointments...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search by doctor or specialty"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
        <View style={styles.filterBar}>
          <Text variant="bodyMedium">Active filter: </Text>
          {activeFilter ? (
            <Chip 
              onClose={() => setActiveFilter(null)}
              style={{ backgroundColor: getStatusColor(activeFilter) }}
              textStyle={{ color: 'white' }}
            >
              {activeFilter.toUpperCase()}
            </Chip>
          ) : (
            <Text variant="bodyMedium">None</Text>
          )}
          <IconButton 
            icon="filter" 
            onPress={() => setFilterModalVisible(true)} 
            size={24}
          />
        </View>
      </View>

      <FlatList
        data={filteredAppointments}
        renderItem={renderItem}
        keyExtractor={(item) => item.id || `${item.doctorId}-${item.appointmentDate}-${item.timeSlot}`}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
          />
        }
      />

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={() => navigation.navigate('Home')}
        label="Book New"
      />

      <Portal>
        <Modal
          visible={filterModalVisible}
          onDismiss={() => setFilterModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text variant="titleMedium" style={styles.modalTitle}>Filter Appointments</Text>
          <Divider style={styles.modalDivider} />
          
          <Button 
            mode={activeFilter === 'pending' ? 'contained' : 'outlined'}
            style={styles.filterButton}
            onPress={() => applyFilter('pending')}
          >
            Pending
          </Button>
          
          <Button 
            mode={activeFilter === 'confirmed' ? 'contained' : 'outlined'}
            style={styles.filterButton}
            onPress={() => applyFilter('confirmed')}
          >
            Confirmed
          </Button>
          
          <Button 
            mode={activeFilter === 'cancelled' ? 'contained' : 'outlined'}
            style={styles.filterButton}
            onPress={() => applyFilter('cancelled')}
          >
            Cancelled
          </Button>
          
          <Button 
            mode={activeFilter === 'completed' ? 'contained' : 'outlined'}
            style={styles.filterButton}
            onPress={() => applyFilter('completed')}
          >
            Completed
          </Button>
          
          <Button 
            mode="text"
            onPress={() => applyFilter(null)}
            style={styles.clearButton}
          >
            Clear Filter
          </Button>
        </Modal>

        {/* Reschedule modal */}
        <Modal
          visible={rescheduleModalVisible}
          onDismiss={() => setRescheduleModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text variant="titleMedium" style={styles.modalTitle}>Reschedule Appointment</Text>
          <Divider style={styles.modalDivider} />
          
          {selectedAppointment && (
            <>
              <Text variant="titleSmall" style={styles.doctorInfo}>
                Dr. {selectedAppointment.doctorName} - {selectedAppointment.department}
              </Text>
              
              <Text variant="bodyMedium" style={styles.sectionTitle}>Select New Date:</Text>
              <Button
                mode="outlined"
                onPress={() => setShowDatePicker(true)}
                style={styles.dateButton}
              >
                {format(newDate, 'MMMM dd, yyyy')}
              </Button>

              {showDatePicker && (
                <DateTimePicker
                  value={newDate}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                />
              )}
              
              <Text variant="bodyMedium" style={styles.sectionTitle}>Select New Time Slot:</Text>
              <View style={styles.timeSlotsContainer}>
                {timeSlots.map((slot) => (
                  <Chip
                    key={slot}
                    selected={newTimeSlot === slot}
                    onPress={() => setNewTimeSlot(slot)}
                    style={[
                      styles.timeSlot,
                      newTimeSlot === slot && { backgroundColor: theme.colors.primary }
                    ]}
                    textStyle={newTimeSlot === slot ? { color: 'white' } : {}}
                  >
                    {slot}
                  </Chip>
                ))}
              </View>
              
              <View style={styles.buttonRow}>
                <Button 
                  mode="outlined" 
                  onPress={() => setRescheduleModalVisible(false)}
                  style={styles.modalButton}
                >
                  Cancel
                </Button>
                <Button 
                  mode="contained" 
                  onPress={rescheduleAppointment}
                  style={styles.modalButton}
                  disabled={!newTimeSlot}
                >
                  Confirm
                </Button>
              </View>
            </>
          )}
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
  header: {
    padding: 16,
    backgroundColor: 'white',
    elevation: 4,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#f0f0f0',
  },
  filterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 80, // Extra padding for FAB
  },
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  department: {
    marginTop: 4,
    color: '#666',
  },
  divider: {
    marginVertical: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  reasonContainer: {
    marginTop: 8,
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
  },
  reasonLabel: {
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#666',
  },
  reasonText: {
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  bookButton: {
    paddingHorizontal: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
    maxHeight: '80%',
  },
  modalTitle: {
    textAlign: 'center',
    marginBottom: 16,
  },
  modalDivider: {
    marginBottom: 16,
  },
  filterButton: {
    marginBottom: 8,
  },
  clearButton: {
    marginTop: 8,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontWeight: 'bold',
  },
  doctorInfo: {
    marginBottom: 16,
    fontStyle: 'italic',
  },
  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  timeSlot: {
    marginBottom: 8,
  },
  dateButton: {
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
}); 