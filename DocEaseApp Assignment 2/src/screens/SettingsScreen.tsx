import React, { useState } from 'react';
import { StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, Surface, Button, TextInput, Divider, List } from 'react-native-paper';
import { auth } from '../utils/firebase';

const SettingsScreen = () => {
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = async () => {
    // Validate inputs
    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password should be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      const currentUser = auth().currentUser;
      if (!currentUser || !currentUser.email) {
        throw new Error('No user is currently logged in');
      }

      // Reauthenticate user with current password
      const credential = auth.EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );

      // Reauthenticate
      await currentUser.reauthenticateWithCredential(credential);
      
      // Update password
      await currentUser.updatePassword(newPassword);
      
      // Reset form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordChange(false);
      
      Alert.alert('Success', 'Password has been updated successfully');
    } catch (error: any) {
      let errorMessage = 'Failed to update password';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'New password is too weak';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please log out and log in again before changing your password';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendResetEmail = async () => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser || !currentUser.email) {
        throw new Error('No user is currently logged in');
      }

      await auth().sendPasswordResetEmail(currentUser.email);
      Alert.alert('Success', 'Password reset email sent to ' + currentUser.email);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to send password reset email');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <Text variant="headlineMedium" style={styles.title}>Settings</Text>
      </Surface>

      <Surface style={styles.section} elevation={2}>
        <List.Section>
          <List.Subheader>Account & Security</List.Subheader>
          
          <List.Item
            title="Change Password"
            left={props => <List.Icon {...props} icon="lock-reset" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => setShowPasswordChange(!showPasswordChange)}
          />
          
          {showPasswordChange && (
            <Surface style={styles.passwordForm} elevation={0}>
              <TextInput
                label="Current Password"
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry
                mode="outlined"
                style={styles.input}
              />
              
              <TextInput
                label="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
                mode="outlined"
                style={styles.input}
              />
              
              <TextInput
                label="Confirm New Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
                mode="outlined"
                style={styles.input}
              />
              
              <Button
                mode="contained"
                onPress={handlePasswordChange}
                loading={isLoading}
                disabled={isLoading}
                style={styles.button}>
                Update Password
              </Button>
            </Surface>
          )}
          
          <Divider />
          
          <List.Item
            title="Send Password Reset Email"
            description="Send email with password reset link to your email address"
            left={props => <List.Icon {...props} icon="email" />}
            onPress={handleSendResetEmail}
          />
        </List.Section>
      </Surface>

      <Surface style={styles.section} elevation={2}>
        <List.Section>
          <List.Subheader>App Preferences</List.Subheader>
          
          <List.Item
            title="Notifications"
            left={props => <List.Icon {...props} icon="bell" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          
          <List.Item
            title="Privacy Settings"
            left={props => <List.Icon {...props} icon="shield-account" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
        </List.Section>
      </Surface>

      <Surface style={styles.section} elevation={2}>
        <List.Section>
          <List.Subheader>About</List.Subheader>
          
          <List.Item
            title="App Version"
            description="1.0.0"
            left={props => <List.Icon {...props} icon="information" />}
          />
          
          <List.Item
            title="Terms of Service"
            left={props => <List.Icon {...props} icon="file-document" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
          
          <List.Item
            title="Privacy Policy"
            left={props => <List.Icon {...props} icon="shield" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
          />
        </List.Section>
      </Surface>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  title: {
    textAlign: 'center',
  },
  section: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  passwordForm: {
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
  },
});

export default SettingsScreen; 