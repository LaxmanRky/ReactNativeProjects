import React, {useState} from 'react';
import {
  View,
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

// Test credentials - keep for testing convenience
const TEST_CREDENTIALS = {
  email: 'test@docease.com',
  password: 'password123',
};

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
      
      // For testing convenience, allow using hardcoded test credentials if Firebase fails
      if (email === TEST_CREDENTIALS.email && password === TEST_CREDENTIALS.password) {
        console.log('Using test credentials as fallback');
        setIsLoading(false);
        navigation.replace('MainTabs');
        return;
      }
      
      setErrorMsg(errorMessage);
      Alert.alert('Login Failed', errorMessage);
      setIsLoading(false);
    }
  };

  const fillTestCredentials = () => {
    setEmail(TEST_CREDENTIALS.email);
    setPassword(TEST_CREDENTIALS.password);
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
            onPress={() => navigation.navigate('SignUp')}
            style={styles.linkButton}>
            Don't have an account? Sign Up
          </Button>
          
          {/* Test credentials helper text */}
          <View style={styles.testCredentials}>
            <Text variant="bodySmall" style={styles.testCredentialsText}>
              Test Credentials:
            </Text>
            <Text variant="bodySmall" style={styles.testCredentialsText}>
              Email: {TEST_CREDENTIALS.email}
            </Text>
            <Text variant="bodySmall" style={styles.testCredentialsText}>
              Password: {TEST_CREDENTIALS.password}
            </Text>
            <Button
              mode="text"
              compact
              onPress={fillTestCredentials}
              style={styles.fillCredentialsButton}>
              Use Test Credentials
            </Button>
          </View>
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
  linkButton: {
    marginTop: 8,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  testCredentials: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  testCredentialsText: {
    textAlign: 'center',
    color: '#666',
  },
  fillCredentialsButton: {
    marginTop: 8,
  },
});

export default LoginScreen; 