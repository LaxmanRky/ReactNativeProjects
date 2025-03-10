// User model class
class User {
  constructor(id, email, displayName = '', photoURL = '') {
    this.id = id;
    this.email = email;
    this.displayName = displayName;
    this.photoURL = photoURL;
    this.createdAt = new Date();
  }

  // Convert Firebase user to our User model
  static fromFirebaseUser(firebaseUser) {
    try {
      if (!firebaseUser) {
        console.log('[User] No Firebase user provided to fromFirebaseUser');
        return null;
      }
      
      console.log('[User] Converting Firebase user to User model:', 
        firebaseUser.uid ? `ID: ${firebaseUser.uid.substring(0, 5)}...` : 'No UID',
        firebaseUser.email ? `Email: ${firebaseUser.email}` : 'No email'
      );
      
      return new User(
        firebaseUser.uid || '',
        firebaseUser.email || '',
        firebaseUser.displayName || '',
        firebaseUser.photoURL || ''
      );
    } catch (error) {
      console.error('[User] Error converting Firebase user:', error);
      // Return a minimal user object if possible
      if (firebaseUser && firebaseUser.uid) {
        return new User(
          firebaseUser.uid,
          firebaseUser.email || 'unknown@email.com',
          '',
          ''
        );
      }
      return null;
    }
  }

  // Convert to plain object for storage
  toJSON() {
    return {
      id: this.id,
      email: this.email,
      displayName: this.displayName,
      photoURL: this.photoURL,
      createdAt: this.createdAt
    };
  }
}

export default User;
