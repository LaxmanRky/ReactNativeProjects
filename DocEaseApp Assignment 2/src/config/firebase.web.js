// Firebase Web SDK configuration
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBR2UM4s50oKn_GGAmohhmrlHaFbl_Ck_c",
  authDomain: "docease-bb734.firebaseapp.com",
  databaseURL: "https://docease-bb734-default-rtdb.firebaseio.com",
  projectId: "docease-bb734",
  storageBucket: "docease-bb734.appspot.com",
  messagingSenderId: "592405209778",
  appId: "1:592405209778:web:968f97bd731edf1cff1fab"
};

// Initialization state tracking
let _initialized = false;
let _initializing = false;
let _authInitialized = false;
let _databaseInitialized = false;
let _initError = null;
let _initPromise = null;

// Initialize Firebase
let app = null;
let auth = null;
let database = null;

// Ensure we only initialize Firebase once
const initializeFirebase = () => {
  if (app !== null) {
    console.log('Firebase already initialized, skipping initialization');
    return;
  }

  try {
    console.log('Initializing Firebase app...');
    app = initializeApp(firebaseConfig);
    console.log('Firebase app initialized successfully');
    
    // Initialize Firebase Auth
    console.log('Initializing Firebase Auth...');
    auth = getAuth(app);
    
    // Initialize Firebase Realtime Database
    console.log('Initializing Firebase Realtime Database...');
    database = getDatabase(app);
    
    // Set up auth state change listener to track when auth is fully initialized
    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        console.log('Auth state changed, user:', user ? 'authenticated' : 'not authenticated');
        _authInitialized = true;
        checkInitializationStatus();
        unsubscribe(); // Only need to listen once to confirm auth is working
      },
      (error) => {
        console.error('Auth state change error:', error);
        _initError = error;
        _authInitialized = false;
        checkInitializationStatus();
        unsubscribe();
      }
    );
    
    // Mark database as initialized (we can't easily check this like auth)
    _databaseInitialized = true;
    
    // Check initialization status
    checkInitializationStatus();
  } catch (error) {
    console.error('Firebase initialization error:', error);
    _initError = error;
  }
};

// Function to check if all Firebase services are initialized
function checkInitializationStatus() {
  if (_authInitialized && _databaseInitialized) {
    console.log('All Firebase services initialized successfully');
    _initialized = true;
    _initializing = false;
  }
}

// Function to check if Firebase is fully initialized
function isFirebaseInitialized() {
  return _initialized && app !== null && auth !== null && database !== null;
}

// Function to get initialization error if any
function getInitializationError() {
  return _initError;
}

// Function to initialize Firebase asynchronously with timeout
function initializeFirebaseAsync() {
  if (_initialized) {
    return Promise.resolve(true);
  }
  
  if (_initError) {
    return Promise.reject(_initError);
  }
  
  if (_initPromise) {
    return _initPromise;
  }
  
  _initializing = true;
  
  // Initialize Firebase if not already initialized
  if (app === null) {
    initializeFirebase();
  }
  
  _initPromise = new Promise((resolve, reject) => {
    // Check status every 100ms for up to 10 seconds
    let attempts = 0;
    const maxAttempts = 100;
    
    const checkStatus = () => {
      if (_initialized) {
        resolve(true);
        return;
      }
      
      if (_initError) {
        reject(_initError);
        return;
      }
      
      attempts++;
      if (attempts >= maxAttempts) {
        const timeoutError = new Error('Firebase initialization timed out after 10 seconds');
        _initError = timeoutError;
        reject(timeoutError);
        return;
      }
      
      setTimeout(checkStatus, 100);
    };
    
    checkStatus();
  });
  
  return _initPromise;
}

// Initialize Firebase immediately
initializeFirebase();

// Wait for Firebase to initialize
console.log('Waiting for Firebase to fully initialize...');
initializeFirebaseAsync()
  .then(() => {
    console.log('Firebase initialization completed successfully');
  })
  .catch((error) => {
    console.error('Firebase initialization failed:', error);
  });

export { 
  app, 
  auth, 
  database, 
  isFirebaseInitialized, 
  getInitializationError,
  initializeFirebaseAsync
};
