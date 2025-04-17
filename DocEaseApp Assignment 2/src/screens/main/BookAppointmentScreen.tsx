import React, {useState} from 'react';
import {View, StyleSheet, ScrollView} from 'react-native';
import {
  Text,
  Button,
  Surface,
  RadioButton,
  Chip,
} from 'react-native-paper';

interface BookAppointmentScreenProps {
  route: any;
  navigation: any;
}

const BookAppointmentScreen: React.FC<BookAppointmentScreenProps> = ({
  route,
  navigation,
}) => {
  const {doctorId} = route.params;

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [appointmentType, setAppointmentType] = useState('in-person');

  // Mock data - In a real app, these would come from an API
  const availableDates = [
    '2024-03-20',
    '2024-03-21',
    '2024-03-22',
    '2024-03-23',
    '2024-03-24',
  ];

  const timeSlots = [
    '09:00 AM',
    '10:00 AM',
    '11:00 AM',
    '02:00 PM',
    '03:00 PM',
    '04:00 PM',
  ];

  const handleBookAppointment = () => {
    // TODO: Implement appointment booking logic
    navigation.navigate('AppointmentConfirmation', {
      doctorId,
      date: selectedDate,
      time: selectedTime,
      type: appointmentType,
    });
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.section} elevation={2}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Select Appointment Type
        </Text>
        <RadioButton.Group
          onValueChange={value => setAppointmentType(value)}
          value={appointmentType}>
          <View style={styles.radioOption}>
            <RadioButton value="in-person" />
            <Text>In-Person Visit</Text>
          </View>
          <View style={styles.radioOption}>
            <RadioButton value="video" />
            <Text>Video Consultation</Text>
          </View>
        </RadioButton.Group>
      </Surface>

      <Surface style={styles.section} elevation={2}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Select Date
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dateContainer}>
          {availableDates.map(date => (
            <Chip
              key={date}
              selected={selectedDate === date}
              onPress={() => setSelectedDate(date)}
              style={styles.dateChip}>
              {new Date(date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </Chip>
          ))}
        </ScrollView>
      </Surface>

      <Surface style={styles.section} elevation={2}>
        <Text variant="titleLarge" style={styles.sectionTitle}>
          Select Time
        </Text>
        <View style={styles.timeGrid}>
          {timeSlots.map(time => (
            <Chip
              key={time}
              selected={selectedTime === time}
              onPress={() => setSelectedTime(time)}
              style={styles.timeChip}>
              {time}
            </Chip>
          ))}
        </View>
      </Surface>

      <Surface style={styles.summarySection} elevation={2}>
        <Text variant="titleMedium" style={styles.summaryTitle}>
          Appointment Summary
        </Text>
        <View style={styles.summaryContent}>
          <Text variant="bodyLarge">
            Type: {appointmentType === 'in-person' ? 'In-Person Visit' : 'Video Consultation'}
          </Text>
          <Text variant="bodyLarge">
            Date: {selectedDate ? new Date(selectedDate).toLocaleDateString() : 'Not selected'}
          </Text>
          <Text variant="bodyLarge">
            Time: {selectedTime || 'Not selected'}
          </Text>
        </View>
        <Button
          mode="contained"
          onPress={handleBookAppointment}
          disabled={!selectedDate || !selectedTime}
          style={styles.bookButton}>
          Confirm Booking
        </Button>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dateChip: {
    marginRight: 8,
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  timeChip: {
    marginBottom: 8,
  },
  summarySection: {
    margin: 16,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  summaryTitle: {
    marginBottom: 16,
  },
  summaryContent: {
    marginBottom: 16,
  },
  bookButton: {
    marginTop: 16,
  },
});

export default BookAppointmentScreen; 