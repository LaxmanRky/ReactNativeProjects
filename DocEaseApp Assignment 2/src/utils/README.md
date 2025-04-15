# Firebase Integration in Docease

This document explains how Firebase is integrated into the Docease application.

## Setup

Firebase is configured in the `src/utils/firebase.ts` file. This file initializes Firebase with the configuration provided and exports various Firebase services for use throughout the app.

## Available Firebase Services

The following Firebase services are initialized and available for use:

- **Authentication** (`auth`): For user registration, login, and management
- **Realtime Database** (`database`): For storing and retrieving data in real-time
- **Firestore** (`firestore`): For document-based data storage
- **Storage** (`storage`): For storing user files like images and documents

## Usage Examples

### Authentication

Authentication is implemented in the login and signup screens:

```typescript
// Login example
import {signInWithEmailAndPassword} from 'firebase/auth';
import {auth} from '../utils/firebase';

// Sign in
await signInWithEmailAndPassword(auth, email, password);
```

### Database

Database operations are handled through the `databaseService.ts` utility, which provides functions for common database operations:

```typescript
// Save user profile
import {databaseService} from '../utils/databaseService';

await databaseService.saveUserProfile(userId, profileData);

// Get user data
const userData = await databaseService.getUserProfile(userId);

// Listen to changes
const unsubscribe = databaseService.subscribeToUserProfile(userId, data => {
  // Handle updated data
});

// Clean up listener when done
unsubscribe();
```

## Adding New Firebase Features

To add a new Firebase feature:

1. Import the necessary functions from Firebase
2. If it's a common operation, consider adding it to the `databaseService.ts` utility
3. Use the Firebase service in your components as needed

## Security Rules

Remember to set up appropriate security rules in the Firebase console to protect your data.

## Environment Variables

In a production environment, Firebase config values should be stored in environment variables instead of being hardcoded in the source code.
