import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  query, 
  where,
  orderBy,
  Timestamp,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './config';
import { Doctor, Appointment, Patient, Review } from '../types/firebase';

// Collection References
const doctorsCollection = collection(db, 'doctors');
const appointmentsCollection = collection(db, 'appointments');
const patientsCollection = collection(db, 'patients');
const reviewsCollection = collection(db, 'reviews');

// Doctor Operations
export const getDoctors = async (): Promise<Doctor[]> => {
  const snapshot = await getDocs(doctorsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
};

export const getDoctorById = async (id: string): Promise<Doctor | null> => {
  const docRef = doc(db, 'doctors', id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Doctor;
  } else {
    return null;
  }
};

export const getDoctorsBySpecialization = async (specialization: string): Promise<Doctor[]> => {
  const q = query(doctorsCollection, where("specialization", "==", specialization));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Doctor));
};

// Appointment Operations
export const createAppointment = async (appointment: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  const newAppointment = {
    ...appointment,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  const docRef = await addDoc(appointmentsCollection, newAppointment);
  return docRef.id;
};

export const getAppointmentsByPatient = async (patientId: string): Promise<Appointment[]> => {
  const q = query(appointmentsCollection, where("patientId", "==", patientId));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return { 
      id: doc.id, 
      ...data,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate()
    } as Appointment;
  });
};

export const getAppointmentsByDoctor = async (doctorId: string): Promise<Appointment[]> => {
  const q = query(appointmentsCollection, where("doctorId", "==", doctorId));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return { 
      id: doc.id, 
      ...data,
      createdAt: (data.createdAt as Timestamp).toDate(),
      updatedAt: (data.updatedAt as Timestamp).toDate()
    } as Appointment;
  });
};

export const updateAppointmentStatus = async (id: string, status: Appointment['status'], notes?: string): Promise<void> => {
  const appointmentRef = doc(db, 'appointments', id);
  await updateDoc(appointmentRef, {
    status,
    notes: notes || '',
    updatedAt: serverTimestamp()
  });
};

// Patient Operations
export const createPatient = async (patient: Omit<Patient, 'id'>): Promise<string> => {
  const docRef = await addDoc(patientsCollection, patient);
  return docRef.id;
};

export const getPatientById = async (id: string): Promise<Patient | null> => {
  const docRef = doc(db, 'patients', id);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as Patient;
  } else {
    return null;
  }
};

export const updatePatient = async (id: string, data: Partial<Patient>): Promise<void> => {
  const patientRef = doc(db, 'patients', id);
  await updateDoc(patientRef, data);
};

// Review Operations
export const addReview = async (review: Omit<Review, 'id' | 'createdAt'>): Promise<string> => {
  const newReview = {
    ...review,
    createdAt: serverTimestamp()
  };
  
  const docRef = await addDoc(reviewsCollection, newReview);
  return docRef.id;
};

export const getDoctorReviews = async (doctorId: string): Promise<Review[]> => {
  const q = query(
    reviewsCollection, 
    where("doctorId", "==", doctorId),
    orderBy("createdAt", "desc")
  );
  
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return { 
      id: doc.id, 
      ...data,
      createdAt: (data.createdAt as Timestamp).toDate()
    } as Review;
  });
}; 