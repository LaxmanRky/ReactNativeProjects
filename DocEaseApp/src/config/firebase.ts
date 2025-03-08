import firebase from '@react-native-firebase/app';
import '@react-native-firebase/auth';
import '@react-native-firebase/database';

const firebaseConfig = {
  apiKey: "AIzaSyBR2UM4s50oKn_GGAmohhmrlHaFbI_Ck_c",
  projectId: "docease-bb734",
  databaseURL: "https://docease-bb734-default-rtdb.firebaseio.com",
  appId: "1:592405209778:android:968f97bd731edf1cff1fab"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const database = firebase.database();
export default firebase;
