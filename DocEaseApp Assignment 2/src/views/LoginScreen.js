import React, { useState, useEffect } from 'react';
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
import { isFirebaseInitialized } from '../config/firebase.web';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [error, setError] = useState('');
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [renderComplete, setRenderComplete] = useState(false);

  useEffect(() => {
    const checkFirebase = () => {
      const isReady = isFirebaseInitialized();
      console.log('Firebase initialization check:', isReady ? 'Ready' : 'Not ready');
      setFirebaseReady(isReady);
      
      if (!isReady) {
        setTimeout(checkFirebase, 1000);
      }
    };
    
    checkFirebase();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRenderComplete(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (loginSuccess && Platform.OS === 'web') {
      console.log('Login successful on web, redirecting to home');
      window.location.href = '/';
    }
  }, [loginSuccess]);

  const handleLogin = async () => {
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    if (!firebaseReady) {
      setError('Firebase is not fully initialized yet. Please try again in a moment.');
      return;
    }

    try {
      setLoading(true);
      console.log('Attempting login with:', email);
      const user = await authController.loginUser(email, password);
      setLoading(false);
      
      if (user) {
        console.log('Login successful:', user);
        setLoginSuccess(true);
        
        if (navigation) {
          navigation.reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        }
      }
    } catch (error) {
      setLoading(false);
      console.error('Login error:', error);
      setError(error.message || 'An unknown error occurred');
    }
  };

  const navigateToRegister = () => {
    if (navigation) {
      navigation.navigate('Register');
    } else if (Platform.OS === 'web') {
      window.location.href = '/register';
    }
  };

  const handleForgotPassword = async () => {
    setError('');
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      await authController.resetPassword(email);
      setLoading(false);
      Alert.alert('Password Reset', 'Password reset email has been sent to your email address');
    } catch (error) {
      setLoading(false);
      setError(error.message || 'An unknown error occurred');
    }
  };

  if (!renderComplete || !firebaseReady) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>
            {!renderComplete ? 'Loading...' : 'Initializing Firebase...'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>DocEase</Text>
        <Text style={styles.subtitle}>Login to your account</Text>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity 
          style={styles.loginButton} 
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Login</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.forgotPasswordButton} 
          onPress={handleForgotPassword}
          disabled={loading}
        >
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </TouchableOpacity>
        
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={navigateToRegister}>
            <Text style={styles.registerLink}>Register</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    width: '100%',
    height: '100%',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3498db',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#3498db',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPasswordButton: {
    marginTop: 15,
    alignSelf: 'center',
  },
  forgotPasswordText: {
    color: '#3498db',
    fontSize: 14,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  registerText: {
    color: '#7f8c8d',
    fontSize: 14,
  },
  registerLink: {
    color: '#3498db',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorText: {
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 15,
  },
  loadingContainer: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
    minWidth: 250,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#7f8c8d',
  }
});

export default LoginScreen;
