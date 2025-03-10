import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator 
} from 'react-native';
import authController from '../controllers/AuthController';

const ProfileScreen = ({ navigation }) => {
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Get current user when component mounts
    const currentUser = authController.getCurrentUser();
    setUser(currentUser);
    
    if (currentUser && currentUser.displayName) {
      setDisplayName(currentUser.displayName);
    }
  }, []);

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const updatedUser = await authController.updateUserProfile(displayName);
      setLoading(false);
      
      if (updatedUser) {
        setUser(updatedUser);
        Alert.alert(
          'Profile Updated',
          'Your profile has been updated successfully',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Update Failed', error.message);
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Edit Profile</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={user.email}
          editable={false}
        />

        <Text style={styles.label}>Display Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your name"
          value={displayName}
          onChangeText={setDisplayName}
        />
      </View>

      <TouchableOpacity 
        style={styles.button} 
        onPress={handleUpdateProfile}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Update Profile</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.cancelButton} 
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginTop: 40,
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 30,
  },
  label: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 5,
    padding: 15,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  disabledInput: {
    backgroundColor: '#f9f9f9',
    color: '#95a5a6',
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#7f8c8d',
    fontSize: 16,
  },
});

export default ProfileScreen;
