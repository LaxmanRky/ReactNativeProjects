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
import { auth } from '../../utils/firebase';

// Test credentials still kept for development ease
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

  const handleLogin = async () => {
    setIsLoading(true);
    
    // Simple validation
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      // Authenticate with Firebase
      await auth().signInWithEmailAndPassword(email, password);
      
      // Successfully logged in
      navigation.replace('MainTabs');
    } catch (error: any) {
      // Handle specific Firebase auth errors
      let errorMessage = 'Invalid email or password';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid credentials';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed login attempts. Try again later';
      }
      
      Alert.alert('Login Failed', errorMessage);
      setIsLoading(false);
    }
  };

  // For development purposes - fill in test credentials
  const useTestCredentials = () => {
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
            mode="text"
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotPasswordButton}>
            Forgot Password?
          </Button>
          
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
          
          {/* Test credentials helper for dev environment */}
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
              onPress={useTestCredentials}
              style={styles.testButton}>
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
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  button: {
    marginTop: 8,
    marginBottom: 16,
  },
  linkButton: {
    marginTop: 8,
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
  testButton: {
    marginTop: 5,
  },
});

export default LoginScreen; 