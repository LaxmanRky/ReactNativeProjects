import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyArnJih0j6AapYJ4aufo-V7aK_dm6-6VIQ",
  authDomain: "docease-bb734.firebaseapp.com",
  databaseURL: "https://docease-bb734-default-rtdb.firebaseio.com",
  projectId: "docease-bb734",
  storageBucket: "docease-bb734.firebasestorage.app",
  messagingSenderId: "592405209778",
  appId: "1:592405209778:web:bdb336e6b74b7f05ff1fab",
  measurementId: "G-SHVZQRYPYJ"
};

// Initialize Firebase if it's not already initialized
if (!firebase.apps.length) {
  try {
    firebase.initializeApp(firebaseConfig);
    console.log('Firebase initialized successfully');
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

const auth = firebase.auth();
const db = firebase.firestore();

export { auth, db };