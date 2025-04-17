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
  ActivityIndicator,
} from 'react-native-paper';
import { auth, db } from '../../firebase/config';

interface SignUpScreenProps {
  navigation: any;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({navigation}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSignUp = async () => {
    // Reset error message
    setErrorMsg('');
    
    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
      setErrorMsg('Please fill in all required fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setErrorMsg('Password should be at least 6 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Create user with React Native Firebase Authentication
      const userCredential = await auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Update user profile with display name
      await user.updateProfile({
        displayName: name
      });
      
      // Create user document in Firestore
      await db.collection('users').doc(user.uid).set({
        name: name,
        email: email,
        phone: phone || '',
        createdAt: new Date().toISOString(),
        role: 'patient',
      });
      
      console.log('User registered successfully');
      Alert.alert('Success', 'Your account has been created', [
        {
          text: 'OK',
          onPress: () => navigation.replace('MainTabs')
        }
      ]);
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Handle different Firebase auth errors
      let errorMessage = 'Failed to create account';
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection';
      } else {
        errorMessage = error.message || 'An error occurred during registration';
      }
      
      setErrorMsg(errorMessage);
      Alert.alert('Registration Failed', errorMessage);
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
            Create Account
          </Text>
          
          {errorMsg ? (
            <Text style={styles.errorText}>{errorMsg}</Text>
          ) : null}
          
          <TextInput
            label="Full Name *"
            value={name}
            onChangeText={setName}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Email *"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
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
            label="Password *"
            value={password}
            onChangeText={setPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
          />
          <TextInput
            label="Confirm Password *"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            mode="outlined"
            secureTextEntry
            style={styles.input}
          />
          
          <Text style={styles.requiredText}>* Required fields</Text>
          
          <Button
            mode="contained"
            onPress={handleSignUp}
            style={styles.button}
            disabled={isLoading}>
            {isLoading ? <ActivityIndicator color="#fff" size={20} /> : 'Sign Up'}
          </Button>
          
          <Button
            mode="text"
            onPress={() => navigation.navigate('Login')}
            style={styles.linkButton}
            disabled={isLoading}>
            Already have an account? Login
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
    paddingVertical: 6,
  },
  linkButton: {
    marginTop: 8,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  requiredText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 16,
    textAlign: 'right',
  },
});

export default SignUpScreen; 