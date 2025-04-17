import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useFirestore } from '../hooks/useFirestore';
import { Appointment } from '../types/firebase';

interface AppointmentListProps {
  patientId?: string;
  doctorId?: string;
  onSelectAppointment?: (appointment: Appointment) => void;
}

const AppointmentList: React.FC<AppointmentListProps> = ({ 
  patientId, 
  doctorId,
  onSelectAppointment 
}) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const { 
    loading, 
    error, 
    getAppointmentsByPatient, 
    getAppointmentsByDoctor,
    updateAppointmentStatus 
  } = useFirestore();

  useEffect(() => {
    const fetchAppointments = async () => {
      if (patientId) {
        const patientAppointments = await getAppointmentsByPatient(patientId);
        setAppointments(patientAppointments);
      } else if (doctorId) {
        const doctorAppointments = await getAppointmentsByDoctor(doctorId);
        setAppointments(doctorAppointments);
      }
    };

    fetchAppointments();
  }, [patientId, doctorId, getAppointmentsByPatient, getAppointmentsByDoctor]);

  const handleCancelAppointment = async (id: string) => {
    Alert.alert(
      'Cancel Appointment',
      'Are you sure you want to cancel this appointment?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes',
          onPress: async () => {
            const success = await updateAppointmentStatus(id, 'cancelled');
            if (success) {
              // Update the local state to reflect the change
              setAppointments(prev => 
                prev.map(appointment => 
                  appointment.id === id 
                    ? { ...appointment, status: 'cancelled' } 
                    : appointment
                )
              );
              Alert.alert('Success', 'Appointment cancelled successfully');
            } else {
              Alert.alert('Error', 'Failed to cancel appointment');
            }
          },
        },
      ],
    );
  };

  const renderAppointmentItem = ({ item }: { item: Appointment }) => {
    return (
      <TouchableOpacity 
        style={[
          styles.appointmentItem,
          item.status === 'cancelled' && styles.cancelledAppointment
        ]}
        onPress={() => onSelectAppointment && onSelectAppointment(item)}
        disabled={item.status === 'cancelled'}
      >
        <View style={styles.appointmentHeader}>
          <Text style={styles.appointmentDate}>{item.date} - {item.time}</Text>
          <View style={[
            styles.statusBadge,
            item.status === 'scheduled' && styles.scheduledBadge,
            item.status === 'completed' && styles.completedBadge,
            item.status === 'cancelled' && styles.cancelledBadge
          ]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        
        <Text style={styles.doctorName}>{patientId ? `Doctor: ${item.doctorName}` : `Patient: ${item.patientName}`}</Text>
        <Text style={styles.reasonText}>Reason: {item.reason}</Text>
        
        {item.status === 'scheduled' && (
          <TouchableOpacity 
            style={styles.cancelButton} 
            onPress={() => handleCancelAppointment(item.id)}
          >
            <Text style={styles.cancelButtonText}>Cancel Appointment</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading && appointments.length === 0) {
    return (
      <View style={styles.container}>
        <Text>Loading appointments...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Error: {error}</Text>
      </View>
    );
  }

  if (appointments.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No appointments found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={appointments}
        renderItem={renderAppointmentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  listContainer: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  appointmentItem: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4a90e2',
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentDate: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  doctorName: {
    fontSize: 14,
    marginBottom: 4,
  },
  reasonText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  scheduledBadge: {
    backgroundColor: '#e3f2fd',
  },
  completedBadge: {
    backgroundColor: '#e8f5e9',
  },
  cancelledBadge: {
    backgroundColor: '#ffebee',
  },
  statusText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  cancelButton: {
    backgroundColor: '#ffebee',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  cancelButtonText: {
    color: '#f44336',
    fontSize: 12,
  },
  cancelledAppointment: {
    opacity: 0.7,
    borderLeftColor: '#bdbdbd',
  },
  errorText: {
    color: 'red',
    margin: 16,
  },
});

export default AppointmentList; 