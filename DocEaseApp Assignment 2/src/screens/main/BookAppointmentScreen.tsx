import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {
  Text,
  Button,
  Card,
  Chip,
  useTheme,
  Surface,
  TextInput,
  IconButton,
  Avatar,
  Divider,
  SegmentedButtons,
  TouchableRipple,
} from 'react-native-paper';
import { Doctor, TimeSlot } from '../../types/AppointmentTypes';
import { appointmentService } from '../../utils/appointmentService';
import { CalendarList } from 'react-native-calendars';
import moment from 'moment';

interface BookAppointmentScreenProps {
  navigation: any;
  route: any;
}

interface DayAvailability {
  dayOfWeek: string;
  date: string;
  slots: TimeSlot[];
}

const BookAppointmentScreen: React.FC<BookAppointmentScreenProps> = ({
  navigation,
  route,
}) => {
  const doctorId = route.params?.doctorId;
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [reason, setReason] = useState<string>('');
  const [availableDates, setAvailableDates] = useState<{ [date: string]: { marked: boolean } }>({});
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  
  const theme = useTheme();

  // Calculate available dates based on doctor's availability
  const generateAvailableDates = (doctorData: Doctor) => {
    if (!doctorData.availability) return {};

    // Use plain JavaScript Date objects to avoid type issues
    const today = new Date();
    const twoMonthsFromNow = new Date();
    twoMonthsFromNow.setDate(today.getDate() + 60);
    
    const availableDatesObj: { [date: string]: { marked: boolean } } = {};
    const dayAvailabilitiesArray: DayAvailability[] = [];

    // Loop through dates
    const currentDay = new Date(today);
    while (currentDay <= twoMonthsFromNow) {
      // Use moment to format the date
      const momentDate = moment(currentDay);
      const dayOfWeek = momentDate.format('dddd');
      const dayAvailability = doctorData.availability.find(a => a.day === dayOfWeek);

      // If the doctor is available on this day of the week and has slots
      if (dayAvailability && dayAvailability.slots.length > 0) {
        const dateString = momentDate.format('YYYY-MM-DD');
        availableDatesObj[dateString] = { marked: true };

        // Add to day availabilities array
        dayAvailabilitiesArray.push({
          dayOfWeek,
          date: dateString,
          slots: [...dayAvailability.slots] // Clone the slots array
        });
      }
      
      // Move to next day
      currentDay.setDate(currentDay.getDate() + 1);
    }

    return availableDatesObj;
  };

  // Fetch doctor details
  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        setLoading(true);
        if (!doctorId) {
          setError('Doctor ID is missing');
          setLoading(false);
          return;
        }
        
        const doctorData = await appointmentService.getDoctorById(doctorId);
        if (doctorData) {
          setDoctor(doctorData);
          const availableDatesObj = generateAvailableDates(doctorData);
          setAvailableDates(availableDatesObj);
        } else {
          setError('Doctor not found');
        }
      } catch (err) {
        console.error('Error fetching doctor details:', err);
        setError('Failed to load doctor information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctorDetails();
  }, [doctorId]);

  // Handle date selection
  const handleDateSelect = (day: any) => {
    const selectedDateStr = day.dateString;
    
    // Check if this date is available
    if (availableDates[selectedDateStr]) {
      setSelectedDate(selectedDateStr);
      setSelectedTimeSlot(null);
      
      // Find available slots for this date
      const dayOfWeek = moment(selectedDateStr).format('dddd');
      const dayAvailability = doctor?.availability?.find(a => a.day === dayOfWeek);
      
      if (dayAvailability) {
        setAvailableSlots(dayAvailability.slots.filter(slot => !slot.isBooked));
      } else {
        setAvailableSlots([]);
      }
      
      // Move to next step automatically
      setActiveStep(2);
    }
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (slot: TimeSlot) => {
    setSelectedTimeSlot(slot);
    
    // Move to next step automatically
    setActiveStep(3);
  };

  // Handle booking confirmation
  const handleBookAppointment = async () => {
    if (!doctor || !selectedDate || !selectedTimeSlot || !doctorId) {
      Alert.alert('Error', 'Please select a date and time slot');
      return;
    }

    try {
      setBookingInProgress(true);
      
      // Book the appointment
      await appointmentService.bookAppointment(
        doctorId,
        selectedDate,
        selectedTimeSlot,
        reason
      );
      
      setBookingInProgress(false);
      
      // Show success alert
      Alert.alert(
        'Appointment Booked',
        `Your appointment with ${doctor.name} has been successfully booked for ${moment(selectedDate).format('MMMM D, YYYY')} at ${selectedTimeSlot.startTime}.`,
        [
          {
            text: 'View Appointments',
            onPress: () => navigation.navigate('Appointments'),
          },
          {
            text: 'OK',
            onPress: () => navigation.navigate('Home'),
          },
        ]
      );
    } catch (err) {
      console.error('Error booking appointment:', err);
      setBookingInProgress(false);
      Alert.alert('Error', 'Failed to book appointment. Please try again.');
    }
  };

  // Render loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading doctor information...</Text>
      </View>
    );
  }

  // Render error state
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
    <View style={styles.container}>
      {/* Doctor Header */}
      <Surface style={styles.header} elevation={2}>
        <View style={styles.doctorHeaderContent}>
          {doctor.profileImage ? (
            <Avatar.Image
              size={60}
              source={{ uri: doctor.profileImage }}
              style={styles.doctorAvatar}
            />
          ) : (
            <Avatar.Icon
              size={60}
              icon="doctor"
              color="#fff"
              style={[styles.doctorAvatar, { backgroundColor: theme.colors.primary }]}
            />
          )}
          <View style={styles.doctorInfo}>
            <Text variant="titleMedium" style={styles.doctorName}>
              {doctor.name}
            </Text>
            <Text variant="bodyMedium" style={styles.doctorSpecialty}>
              {doctor.specialty}
            </Text>
            {doctor.fee && (
              <Chip icon="currency-usd" style={styles.feeChip} compact>
                {doctor.fee}/consultation
              </Chip>
            )}
          </View>
        </View>
      </Surface>

      {/* Booking Steps */}
      <View style={styles.stepsContainer}>
        <SegmentedButtons
          value={`${activeStep}`}
          onValueChange={(value) => setActiveStep(parseInt(value))}
          buttons={[
            { value: '1', label: 'Date', disabled: activeStep < 1 },
            { value: '2', label: 'Time', disabled: activeStep < 2 },
            { value: '3', label: 'Confirm', disabled: activeStep < 3 },
          ]}
          style={styles.stepsButtons}
        />
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Step 1: Date Selection */}
        {activeStep === 1 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <IconButton icon="calendar" size={24} />
                <Text variant="titleMedium">Select Date</Text>
              </View>
              
              <CalendarList
                current={moment().format('YYYY-MM-DD')}
                minDate={moment().format('YYYY-MM-DD')}
                maxDate={moment().add(60, 'days').format('YYYY-MM-DD')}
                onDayPress={handleDateSelect}
                markedDates={{
                  ...availableDates,
                  [selectedDate]: { selected: true, marked: true, selectedColor: theme.colors.primary },
                }}
                theme={{
                  selectedDayBackgroundColor: theme.colors.primary,
                  todayTextColor: theme.colors.primary,
                  arrowColor: theme.colors.primary,
                }}
                horizontal={true}
                pagingEnabled={true}
                calendarWidth={320}
                style={styles.calendar}
              />
            </Card.Content>
          </Card>
        )}

        {/* Step 2: Time Slot Selection */}
        {activeStep === 2 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <IconButton icon="clock-outline" size={24} />
                <Text variant="titleMedium">Select Time</Text>
              </View>
              
              <Text variant="titleSmall" style={styles.dateText}>
                {moment(selectedDate).format('dddd, MMMM D, YYYY')}
              </Text>
              
              {availableSlots.length > 0 ? (
                <View style={styles.slotsContainer}>
                  {availableSlots.map((slot) => (
                    <TouchableRipple
                      key={slot.id}
                      onPress={() => handleTimeSlotSelect(slot)}
                      style={[
                        styles.timeSlot,
                        selectedTimeSlot?.id === slot.id && styles.selectedTimeSlot,
                      ]}>
                      <Text
                        style={[
                          styles.timeSlotText,
                          selectedTimeSlot?.id === slot.id && styles.selectedTimeSlotText,
                        ]}>
                        {slot.startTime} - {slot.endTime}
                      </Text>
                    </TouchableRipple>
                  ))}
                </View>
              ) : (
                <Text style={styles.noSlotsText}>
                  No available time slots for this date
                </Text>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Step 3: Confirmation */}
        {activeStep === 3 && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <IconButton icon="check-circle-outline" size={24} />
                <Text variant="titleMedium">Confirm Appointment</Text>
              </View>
              
              <View style={styles.appointmentSummary}>
                <View style={styles.summaryItem}>
                  <Text variant="bodyMedium" style={styles.summaryLabel}>
                    Date:
                  </Text>
                  <Text variant="bodyLarge" style={styles.summaryValue}>
                    {moment(selectedDate).format('dddd, MMMM D, YYYY')}
                  </Text>
                </View>
                
                <View style={styles.summaryItem}>
                  <Text variant="bodyMedium" style={styles.summaryLabel}>
                    Time:
                  </Text>
                  <Text variant="bodyLarge" style={styles.summaryValue}>
                    {selectedTimeSlot?.startTime} - {selectedTimeSlot?.endTime}
                  </Text>
                </View>
                
                <Divider style={styles.divider} />
                
                <View style={styles.summaryItem}>
                  <Text variant="bodyMedium" style={styles.summaryLabel}>
                    Doctor:
                  </Text>
                  <Text variant="bodyLarge" style={styles.summaryValue}>
                    {doctor.name}
                  </Text>
                </View>
                
                <View style={styles.summaryItem}>
                  <Text variant="bodyMedium" style={styles.summaryLabel}>
                    Specialty:
                  </Text>
                  <Text variant="bodyLarge" style={styles.summaryValue}>
                    {doctor.specialty}
                  </Text>
                </View>
                
                <View style={styles.summaryItem}>
                  <Text variant="bodyMedium" style={styles.summaryLabel}>
                    Fee:
                  </Text>
                  <Text variant="bodyLarge" style={styles.summaryValue}>
                    ${doctor.fee || 'N/A'}
                  </Text>
                </View>
                
                <Divider style={styles.divider} />
                
                <TextInput
                  label="Reason for Visit (Optional)"
                  value={reason}
                  onChangeText={setReason}
                  multiline
                  numberOfLines={3}
                  mode="outlined"
                  style={styles.reasonInput}
                />
              </View>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      {/* Navigation Buttons */}
      <Surface style={styles.actionButtons} elevation={2}>
        {activeStep > 1 && (
          <Button
            mode="outlined"
            onPress={() => setActiveStep(activeStep - 1)}
            style={styles.backButton}>
            Back
          </Button>
        )}
        
        {activeStep < 3 ? (
          <Button
            mode="contained"
            onPress={() => {
              if (activeStep === 1 && selectedDate) {
                setActiveStep(2);
              } else if (activeStep === 2 && selectedTimeSlot) {
                setActiveStep(3);
              }
            }}
            disabled={
              (activeStep === 1 && !selectedDate) ||
              (activeStep === 2 && !selectedTimeSlot)
            }
            style={styles.nextButton}>
            Next
          </Button>
        ) : (
          <Button
            mode="contained"
            onPress={handleBookAppointment}
            loading={bookingInProgress}
            disabled={bookingInProgress}
            style={styles.confirmButton}>
            Confirm Booking
          </Button>
        )}
      </Surface>
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
  header: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  doctorHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorAvatar: {
    marginRight: 16,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  doctorSpecialty: {
    marginBottom: 4,
    color: '#666',
  },
  feeChip: {
    alignSelf: 'flex-start',
    height: 24,
  },
  stepsContainer: {
    padding: 16,
  },
  stepsButtons: {
    marginVertical: 8,
  },
  scrollContent: {
    flex: 1,
    padding: 16,
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendar: {
    borderRadius: 8,
  },
  dateText: {
    marginBottom: 16,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  slotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  timeSlot: {
    padding: 10,
    margin: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    minWidth: 100,
    alignItems: 'center',
  },
  selectedTimeSlot: {
    borderColor: '#4CAF50',
    backgroundColor: '#E8F5E9',
  },
  timeSlotText: {
    fontSize: 14,
  },
  selectedTimeSlotText: {
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  noSlotsText: {
    textAlign: 'center',
    marginVertical: 20,
    fontStyle: 'italic',
    color: '#666',
  },
  appointmentSummary: {
    padding: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  summaryLabel: {
    width: 100,
    fontWeight: 'bold',
    color: '#666',
  },
  summaryValue: {
    flex: 1,
  },
  divider: {
    marginVertical: 16,
  },
  reasonInput: {
    marginTop: 8,
    backgroundColor: '#f9f9f9',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#ffffff',
  },
  backButton: {
    flex: 1,
    marginRight: 8,
  },
  nextButton: {
    flex: 2,
    marginLeft: 8,
  },
  confirmButton: {
    flex: 1,
  },
});

export default BookAppointmentScreen; 