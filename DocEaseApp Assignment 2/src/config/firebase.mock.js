// Mock implementation for React Native Firebase modules in web environment
const mockFirebase = {
  apps: [],
  initializeApp: () => {
    console.log('Mock Firebase initialized');
    return {};
  },
  app: () => ({
    auth: () => mockAuth
  })
};

const mockAuth = {
  currentUser: null,
  createUserWithEmailAndPassword: async () => ({ user: { uid: 'mock-uid', email: 'mock@example.com' } }),
  signInWithEmailAndPassword: async () => ({ user: { uid: 'mock-uid', email: 'mock@example.com' } }),
  signOut: async () => {},
  sendPasswordResetEmail: async () => {},
  onAuthStateChanged: (callback) => {
    callback(null);
    return () => {};
  }
};

export default mockFirebase;
export { mockAuth };
