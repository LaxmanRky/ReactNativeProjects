import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
} from 'react-native-paper';
import { auth } from '../../utils/firebase';

interface ResetPasswordConfirmScreenProps {
  navigation: any;
  route: any;
}

const ResetPasswordConfirmScreen: React.FC<ResetPasswordConfirmScreenProps> = ({
  navigation,
  route,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [_email, setEmail] = useState(''); // Using _email to indicate it's intentionally unused
  
  useEffect(() => {
    // Route params would contain oobCode (reset code) from the deep link
    if (route.params?.oobCode) {
      setResetCode(route.params.oobCode);
    }
    
    // Optional: email can be passed as a parameter too
    if (route.params?.email) {
      setEmail(route.params.email);
    }
  }, [route.params]);

  const handlePasswordReset = async () => {
    // Input validation
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password should be at least 6 characters');
      return;
    }

    if (!resetCode) {
      Alert.alert('Error', 'Reset code is missing. Please use the link from your email.');
      return;
    }

    setIsLoading(true);

    try {
      // Confirm the password reset using the code
      await auth().confirmPasswordReset(resetCode, newPassword);
      
      Alert.alert(
        'Success',
        'Your password has been reset successfully. You can now sign in with your new password.',
        [
          {
            text: 'Sign In',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error: any) {
      let errorMessage = 'Failed to reset password';
      
      if (error.code === 'auth/invalid-action-code') {
        errorMessage = 'The reset link has expired or already been used';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else if (error.code === 'auth/expired-action-code') {
        errorMessage = 'The reset link has expired';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!resetCode.trim()) {
      Alert.alert('Error', 'Please enter the reset code');
      return;
    }

    setIsLoading(true);

    try {
      // Verify that the action code is valid
      await auth().verifyPasswordResetCode(resetCode);
      Alert.alert('Success', 'Reset code verified. You can now set a new password.');
    } catch (error: any) {
      let errorMessage = 'Invalid reset code';
      
      if (error.code === 'auth/invalid-action-code') {
        errorMessage = 'The reset link is invalid or has expired';
      } else if (error.code === 'auth/expired-action-code') {
        errorMessage = 'The reset link has expired';
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.surface} elevation={2}>
          <Text variant="headlineMedium" style={styles.title}>
            Reset Your Password
          </Text>
          
          {!route.params?.oobCode && (
            <>
              <Text style={styles.instructionText}>
                Enter the reset code from the email we sent you
              </Text>
              <TextInput
                label="Reset Code"
                value={resetCode}
                onChangeText={setResetCode}
                mode="outlined"
                style={styles.input}
              />
              <Button
                mode="contained"
                onPress={handleVerifyCode}
                loading={isLoading}
                disabled={isLoading}
                style={styles.button}>
                Verify Code
              </Button>
            </>
          )}
          
          <Text style={styles.instructionText}>
            Enter your new password
          </Text>
          
          <TextInput
            label="New Password"
            value={newPassword}
            onChangeText={setNewPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
          />
          
          <TextInput
            label="Confirm New Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
          />
          
          <Button
            mode="contained"
            onPress={handlePasswordReset}
            loading={isLoading}
            disabled={isLoading}
            style={styles.button}>
            Reset Password
          </Button>
          
          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            style={styles.linkButton}>
            Back to Login
          </Button>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  surface: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  title: {
    textAlign: 'center',
    marginBottom: 20,
  },
  instructionText: {
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  linkButton: {
    marginTop: 8,
  },
});

export default ResetPasswordConfirmScreen; 