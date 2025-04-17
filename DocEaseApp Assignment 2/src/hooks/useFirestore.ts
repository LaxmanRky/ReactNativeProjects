import { useState, useCallback } from 'react';
import * as FirestoreService from '../firebase/firestoreService';
import { Appointment, Patient, Review } from '../types/firebase';

export const useFirestore = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset error state
  const resetError = useCallback(() => {
    setError(null);
  }, []);

  // Doctor Hooks
  const getDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const doctors = await FirestoreService.getDoctors();
      setLoading(false);
      return doctors;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return [];
    }
  }, []);

  const getDoctorById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const doctor = await FirestoreService.getDoctorById(id);
      setLoading(false);
      return doctor;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return null;
    }
  }, []);

  const getDoctorsBySpecialization = useCallback(async (specialization: string) => {
    setLoading(true);
    setError(null);
    try {
      const doctors = await FirestoreService.getDoctorsBySpecialization(specialization);
      setLoading(false);
      return doctors;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return [];
    }
  }, []);

  // Appointment Hooks
  const createAppointment = useCallback(async (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const id = await FirestoreService.createAppointment(appointment);
      setLoading(false);
      return id;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return null;
    }
  }, []);

  const getAppointmentsByPatient = useCallback(async (patientId: string) => {
    setLoading(true);
    setError(null);
    try {
      const appointments = await FirestoreService.getAppointmentsByPatient(patientId);
      setLoading(false);
      return appointments;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return [];
    }
  }, []);

  const getAppointmentsByDoctor = useCallback(async (doctorId: string) => {
    setLoading(true);
    setError(null);
    try {
      const appointments = await FirestoreService.getAppointmentsByDoctor(doctorId);
      setLoading(false);
      return appointments;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return [];
    }
  }, []);

  const updateAppointmentStatus = useCallback(async (id: string, status: Appointment['status'], notes?: string) => {
    setLoading(true);
    setError(null);
    try {
      await FirestoreService.updateAppointmentStatus(id, status, notes);
      setLoading(false);
      return true;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return false;
    }
  }, []);

  // Patient Hooks
  const createPatient = useCallback(async (patient: Omit<Patient, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const id = await FirestoreService.createPatient(patient);
      setLoading(false);
      return id;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return null;
    }
  }, []);

  const getPatientById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const patient = await FirestoreService.getPatientById(id);
      setLoading(false);
      return patient;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return null;
    }
  }, []);

  // Review Hooks
  const addReview = useCallback(async (review: Omit<Review, 'id' | 'createdAt'>) => {
    setLoading(true);
    setError(null);
    try {
      const id = await FirestoreService.addReview(review);
      setLoading(false);
      return id;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return null;
    }
  }, []);

  const getDoctorReviews = useCallback(async (doctorId: string) => {
    setLoading(true);
    setError(null);
    try {
      const reviews = await FirestoreService.getDoctorReviews(doctorId);
      setLoading(false);
      return reviews;
    } catch (err) {
      setError((err as Error).message);
      setLoading(false);
      return [];
    }
  }, []);

  return {
    loading,
    error,
    resetError,
    // Doctor methods
    getDoctors,
    getDoctorById,
    getDoctorsBySpecialization,
    // Appointment methods
    createAppointment,
    getAppointmentsByPatient,
    getAppointmentsByDoctor,
    updateAppointmentStatus,
    // Patient methods
    createPatient,
    getPatientById,
    // Review methods
    addReview,
    getDoctorReviews
  };
}; 