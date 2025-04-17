import React, {useState} from 'react';
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
import { auth } from '../../firebase/config';

interface LoginScreenProps {
  navigation: any;
}

const LoginScreen: React.FC<LoginScreenProps> = ({navigation}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    
    // Simple validation
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      // Using React Native Firebase Authentication
      await auth.signInWithEmailAndPassword(email, password);
      
      // If login is successful, navigate to MainTabs
      navigation.replace('MainTabs');
    } catch (error: any) {
      console.error('Login error:', error);
      
      // Handle different Firebase auth errors
      let errorMessage = 'Invalid email or password';
      
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection';
      } else {
        errorMessage = error.message || 'An error occurred during login';
      }
      
      setErrorMsg(errorMessage);
      Alert.alert('Login Failed', errorMessage);
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Email Required', 'Please enter your email address to reset your password');
      return;
    }

    try {
      await auth.sendPasswordResetEmail(email);
      Alert.alert(
        'Password Reset Email Sent',
        'Check your email for instructions to reset your password'
      );
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      let errorMessage = 'Failed to send password reset email';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection';
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
            Welcome to Docease
          </Text>
          
          {errorMsg ? (
            <Text style={styles.errorText}>{errorMsg}</Text>
          ) : null}
          
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.button}
            loading={isLoading}
            disabled={isLoading}>
            Login
          </Button>
          <Button
            mode="text"
            onPress={handleForgotPassword}
            style={styles.forgotPasswordButton}>
            Forgot Password?
          </Button>
          <Button
            mode="text"
            onPress={() => navigation.navigate('SignUp')}
            style={styles.linkButton}>
            Don't have an account? Sign Up
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
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  forgotPasswordButton: {
    marginBottom: 8,
  },
  linkButton: {
    marginTop: 8,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default LoginScreen; 