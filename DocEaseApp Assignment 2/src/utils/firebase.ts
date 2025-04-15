// Import React Native Firebase modules
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Your web app's Firebase configuration
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

// Initialize Firebase if it hasn't been initialized already
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Export the modules for use throughout the app
export { auth, firestore };
export default firebase; 