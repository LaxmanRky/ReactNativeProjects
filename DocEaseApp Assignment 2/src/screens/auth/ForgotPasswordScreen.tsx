import React, {useState} from 'react';
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  View,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Surface,
} from 'react-native-paper';
import { auth } from '../../utils/firebase';

interface ForgotPasswordScreenProps {
  navigation: any;
}

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  const handleResetPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    try {
      setIsLoading(true);
      await auth().sendPasswordResetEmail(email.trim());
      setResetSent(true);
      setIsLoading(false);
    } catch (error: any) {
      setIsLoading(false);
      
      let errorMessage = 'Failed to send password reset email';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address';
      }
      
      Alert.alert('Error', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Surface style={styles.surface} elevation={2}>
          <Text variant="headlineMedium" style={styles.title}>
            Reset Password
          </Text>
          
          {resetSent ? (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>
                Password reset email sent!
              </Text>
              <Text style={styles.instructionText}>
                Check your email and follow the instructions to reset your password.
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('Login')}
                style={styles.button}>
                Back to Login
              </Button>
            </View>
          ) : (
            <>
              <Text style={styles.instructionText}>
                Enter your email address and we'll send you instructions to reset your password.
              </Text>
              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
              <Button
                mode="contained"
                onPress={handleResetPassword}
                loading={isLoading}
                disabled={isLoading}
                style={styles.button}>
                Send Reset Link
              </Button>
            </>
          )}
          
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
  successContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  successText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4caf50',
    marginBottom: 12,
  },
});

export default ForgotPasswordScreen; 