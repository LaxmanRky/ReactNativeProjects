import React, { useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
  Avatar,
} from 'react-native-paper';
import { databaseService } from '../utils/databaseService';
import { auth } from '../utils/firebase';

const ProfileScreen = () => {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const currentUser = auth().currentUser;
      
      if (currentUser) {
        // Try to get profile from database
        const userProfile = await databaseService.getUserProfile(currentUser.uid);
        
        setUser(currentUser);
        
        // If we have profile data in database, populate the form fields
        if (userProfile) {
          setName(userProfile.name || currentUser.displayName || '');
          setPhone(userProfile.phone || '');
          setAddress(userProfile.address || '');
        } else {
          // Otherwise use basic data from auth
          setName(currentUser.displayName || '');
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const currentUser = auth().currentUser;
      
      if (!currentUser) {
        throw new Error('No user logged in');
      }
      
      // Prepare profile data
      const profileData = {
        name,
        phone,
        address,
        email: currentUser.email,
      };
      
      // Save to database
      await databaseService.saveUserProfile(currentUser.uid, profileData);
      
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await auth().signOut();
      // Navigation would typically be handled by an auth state listener
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <Avatar.Text 
          size={80} 
          label={name ? name.charAt(0).toUpperCase() : 'U'} 
          style={styles.avatar}
        />
        <Text variant="headlineSmall" style={styles.profileName}>
          {name || 'User Profile'}
        </Text>
        <Text variant="bodyMedium" style={styles.profileEmail}>
          {user?.email || ''}
        </Text>
      </Surface>
      
      <Surface style={styles.formContainer} elevation={2}>
        <Text variant="titleMedium" style={styles.sectionTitle}>
          Personal Information
        </Text>
        
        <TextInput
          label="Full Name"
          value={name}
          onChangeText={setName}
          mode="outlined"
          style={styles.input}
        />
        
        <TextInput
          label="Phone Number"
          value={phone}
          onChangeText={setPhone}
          mode="outlined"
          keyboardType="phone-pad"
          style={styles.input}
        />
        
        <TextInput
          label="Address"
          value={address}
          onChangeText={setAddress}
          mode="outlined"
          multiline
          numberOfLines={3}
          style={styles.input}
        />
        
        <Button
          mode="contained"
          onPress={handleSaveProfile}
          loading={isSaving}
          disabled={isSaving}
          style={styles.button}>
          Save Profile
        </Button>
      </Surface>
      
      <Surface style={styles.actionContainer} elevation={2}>
        <Button
          mode="outlined"
          onPress={handleSignOut}
          style={styles.signOutButton}
          textColor="#d32f2f">
          Sign Out
        </Button>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 10,
  },
  avatar: {
    marginBottom: 10,
  },
  profileName: {
    marginBottom: 5,
  },
  profileEmail: {
    color: '#666',
  },
  formContainer: {
    padding: 20,
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 10,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  actionContainer: {
    padding: 20,
    marginVertical: 20,
    marginHorizontal: 16,
    borderRadius: 10,
  },
  signOutButton: {
    borderColor: '#d32f2f',
  },
});

export default ProfileScreen; 