import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useFirestore } from '../hooks/useFirestore';
import { Doctor, Review } from '../types/firebase';

interface DoctorDetailsProps {
  doctorId: string;
  onBookAppointment?: () => void;
}

const DoctorDetails: React.FC<DoctorDetailsProps> = ({ doctorId, onBookAppointment }) => {
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const { loading, error, getDoctorById, getDoctorReviews } = useFirestore();

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      const doctorData = await getDoctorById(doctorId);
      if (doctorData) {
        setDoctor(doctorData);
      }
    };

    const fetchDoctorReviews = async () => {
      const reviewsData = await getDoctorReviews(doctorId);
      setReviews(reviewsData);
    };

    fetchDoctorDetails();
    fetchDoctorReviews();
  }, [doctorId, getDoctorById, getDoctorReviews]);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating - fullStars >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
      <View style={styles.starsContainer}>
        {[...Array(fullStars)].map((_, i) => (
          <Text key={`full-${i}`} style={styles.starIcon}>★</Text>
        ))}
        {halfStar && <Text style={styles.starIcon}>✬</Text>}
        {[...Array(emptyStars)].map((_, i) => (
          <Text key={`empty-${i}`} style={[styles.starIcon, styles.emptyStar]}>☆</Text>
        ))}
        <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
      </View>
    );
  };

  if (loading && !doctor) {
    return (
      <View style={styles.container}>
        <Text>Loading doctor details...</Text>
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

  if (!doctor) {
    return (
      <View style={styles.container}>
        <Text>Doctor not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <Image 
          source={{ uri: doctor.imageUrl }} 
          style={styles.profileImage} 
          resizeMode="cover"
        />
        <View style={styles.profileInfo}>
          <Text style={styles.doctorName}>{doctor.name}</Text>
          <Text style={styles.doctorSpecialization}>{doctor.specialization}</Text>
          {renderStars(doctor.rating)}
          <Text style={styles.experience}>{doctor.experience} years experience</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Doctor</Text>
        <Text style={styles.bioText}>{doctor.bio}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Hospital</Text>
        <Text style={styles.hospitalName}>{doctor.hospital}</Text>
        <Text style={styles.hospitalAddress}>{doctor.address}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Consultation Fee</Text>
        <Text style={styles.fee}>${doctor.fees}</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.reviewsHeader}>
          <Text style={styles.sectionTitle}>Patient Reviews</Text>
          <Text style={styles.reviewCount}>({reviews.length})</Text>
        </View>
        
        {reviews.length === 0 ? (
          <Text style={styles.noReviewsText}>No reviews yet</Text>
        ) : (
          reviews.map((review) => (
            <View key={review.id} style={styles.reviewItem}>
              <View style={styles.reviewHeader}>
                {renderStars(review.rating)}
                <Text style={styles.reviewDate}>
                  {review.createdAt.toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.reviewComment}>{review.comment}</Text>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity 
        style={styles.bookButton}
        onPress={onBookAppointment}
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
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  doctorName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  doctorSpecialization: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  experience: {
    fontSize: 14,
    color: '#666',
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  starIcon: {
    fontSize: 16,
    color: '#FFC107',
    marginRight: 2,
  },
  emptyStar: {
    color: '#E0E0E0',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  bioText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#444',
  },
  hospitalName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  hospitalAddress: {
    fontSize: 14,
    color: '#666',
  },
  fee: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  reviewsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reviewCount: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
  },
  noReviewsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  reviewItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reviewDate: {
    fontSize: 12,
    color: '#999',
  },
  reviewComment: {
    fontSize: 14,
    lineHeight: 20,
    color: '#444',
  },
  bookButton: {
    backgroundColor: '#4a90e2',
    margin: 16,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    color: 'red',
    margin: 16,
  },
});

export default DoctorDetails; 