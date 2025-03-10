import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator,
  Platform
} from 'react-native';
import authController from '../controllers/AuthController';

const RegisterScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password should be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      console.log('Registering user with email:', email, 'and display name:', displayName);
      const user = await authController.registerUser(email, password, displayName);
      setLoading(false);
      
      if (user) {
        Alert.alert(
          'Registration Successful',
          'Your account has been created successfully.',
          [
            {
              text: 'OK',
              onPress: () => {
                navigateToLogin();
              }
            }
          ]
        );
        
        // Automatically navigate to login page after a short delay
        // This ensures the alert is visible but doesn't require user interaction
        setTimeout(() => {
          navigateToLogin();
        }, 1500);
      }
    } catch (error) {
      setLoading(false);
      setError(error.message || 'An error occurred during registration');
      console.error('Registration error:', error);
    }
  };

  const navigateToLogin = () => {
    if (Platform.OS === 'web' && !navigation) {
      // For web, we need to handle navigation differently
      // We'll use the history API to avoid a full page reload
      if (window.history && window.history.pushState) {
        window.history.pushState({}, '', '/login');
        // Force React Navigation to update
        window.dispatchEvent(new Event('popstate'));
      } else {
        // Fallback to location.href if history API is not available
        window.location.href = '/login';
      }
    } else {
      // For mobile, use navigation
      navigation.navigate('Login');
    }
  };

  // Display error message if there is one
  const renderError = () => {
    if (!error) return null;
    
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>DocEase</Text>
      <Text style={styles.subtitle}>Create a new account</Text>

      {renderError()}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Email *"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Display Name"
          value={displayName}
          onChangeText={setDisplayName}
          autoCapitalize="words"
        />
        <TextInput
          style={styles.input}
          placeholder="Password *"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password *"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        <Text style={styles.requiredText}>* Required fields</Text>
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>Already have an account? </Text>
        <TouchableOpacity onPress={navigateToLogin}>
          <Text style={styles.loginLink}>Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    color: '#7f8c8d',
  },
  inputContainer: {
    width: '100%',
    maxWidth: 400,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  requiredText: {
    color: '#7f8c8d',
    fontSize: 12,
    marginBottom: 10,
    textAlign: 'right',
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 5,
    padding: 15,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginContainer: {
    flexDirection: 'row',
  },
  loginText: {
    color: '#7f8c8d',
  },
  loginLink: {
    color: '#3498db',
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#ffecec',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#f5c6cb',
  },
  errorText: {
    color: '#721c24',
    textAlign: 'center',
  },
});

export default RegisterScreen;
