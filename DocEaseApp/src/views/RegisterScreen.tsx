import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import AuthController from '../controllers/AuthController';

interface RegisterScreenProps {
  navigation: any;
}

const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor'>('patient');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword || !displayName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const user = await AuthController.registerUser(email, password, role, displayName);
      setLoading(false);
      
      Alert.alert(
        'Registration Successful',
        'Your account has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate based on user role
              if (user.isPatient()) {
                navigation.navigate('PatientDashboard');
              } else if (user.isDoctor()) {
                navigation.navigate('DoctorDashboard');
              }
            },
          },
        ]
      );
    } catch (error: any) {
      setLoading(false);
      Alert.alert('Registration Error', error.message || 'Failed to register');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join DocEase Patient Management System</Text>

        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
          />
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
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />

          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>I am a:</Text>
            <View style={styles.roleToggleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'patient' && styles.roleButtonActive,
                ]}
                onPress={() => setRole('patient')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'patient' && styles.roleButtonTextActive,
                  ]}
                >
                  Patient
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  role === 'doctor' && styles.roleButtonActive,
                ]}
                onPress={() => setRole('doctor')}
              >
                <Text
                  style={[
                    styles.roleButtonText,
                    role === 'doctor' && styles.roleButtonTextActive,
                  ]}
                >
                  Doctor
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.registerButton}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Register</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 40,
  },
  formContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 5,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
  roleContainer: {
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 16,
    marginBottom: 10,
    color: '#2c3e50',
  },
  roleToggleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roleButton: {
    flex: 1,
    backgroundColor: '#f1f2f6',
    padding: 12,
    borderRadius: 5,
    marginHorizontal: 5,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  roleButtonActive: {
    backgroundColor: '#3498db',
    borderColor: '#2980b9',
  },
  roleButtonText: {
    fontSize: 16,
    color: '#7f8c8d',
    fontWeight: '500',
  },
  roleButtonTextActive: {
    color: '#fff',
  },
  registerButton: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#7f8c8d',
    fontSize: 16,
  },
  loginButtonText: {
    color: '#3498db',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RegisterScreen;
