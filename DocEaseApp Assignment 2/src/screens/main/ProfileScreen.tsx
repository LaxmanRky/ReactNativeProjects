import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Alert } from 'react-native';
import {
  Text,
  Avatar,
  Button,
  Surface,
  TextInput,
  Divider,
  useTheme,
  IconButton,
  Portal,
  Modal,
  ActivityIndicator
} from 'react-native-paper';
import { auth, db } from '../../firebase/config';

interface ProfileScreenProps {
  navigation: any;
}

interface UserData {
  name: string;
  email: string;
  phone: string;
  address?: string;
  bloodType?: string;
  emergencyContact?: string;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({navigation}) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<UserData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    bloodType: '',
    emergencyContact: ''
  });
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editField, setEditField] = useState<keyof UserData | null>(null);
  const [editValue, setEditValue] = useState('');
  const [savingData, setSavingData] = useState(false);

  // Wrapping fetchUserData in useCallback to prevent infinite loops
  const fetchUserData = React.useCallback(async () => {
    setLoading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        // Not logged in, navigate to login
        navigation.replace('Login');
        return;
      }

      // Get user data from Firestore
      const userDoc = await db.collection('users').doc(currentUser.uid).get();
      
      if (userDoc.exists) {
        const data = userDoc.data() as UserData;
        setUserData({
          name: data.name || currentUser.displayName || '',
          email: currentUser.email || '',
          phone: data.phone || '',
          address: data.address || '',
          bloodType: data.bloodType || '',
          emergencyContact: data.emergencyContact || ''
        });
      } else {
        // If user document doesn't exist, create one with basic info
        const newUserData = {
          name: currentUser.displayName || '',
          email: currentUser.email || '',
          phone: '',
          createdAt: new Date().toISOString(),
          role: 'patient'
        };
        
        await db.collection('users').doc(currentUser.uid).set(newUserData);
        setUserData({...newUserData, address: '', bloodType: '', emergencyContact: ''});
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  }, [navigation]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const handleEdit = (field: keyof UserData) => {
    setEditField(field);
    setEditValue(userData[field] || '');
    setEditModalVisible(true);
  };

  const saveField = async () => {
    if (!editField) return;
    
    try {
      setSavingData(true);
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      
      // Update local state
      const updatedUserData = {
        ...userData,
        [editField]: editValue
      };
      setUserData(updatedUserData);
      
      // Update Firestore
      await db.collection('users').doc(currentUser.uid).update({
        [editField]: editValue,
        updatedAt: new Date().toISOString()
      });
      
      // If name was updated, also update auth profile
      if (editField === 'name') {
        await currentUser.updateProfile({
          displayName: editValue
        });
      }
      
      setEditModalVisible(false);
      setEditField(null);
      setEditValue('');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile information');
    } finally {
      setSavingData(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout', 
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          onPress: () => {
            auth.signOut()
              .then(() => {
                navigation.replace('Login');
              })
              .catch((error) => {
                console.error('Logout error:', error);
                Alert.alert('Error', 'Failed to logout. Please try again.');
              });
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text>Loading profile...</Text>
      </View>
    );
  }

  const getFieldIcon = (field: keyof UserData) => {
    switch(field) {
      case 'name': return 'account';
      case 'email': return 'email';
      case 'phone': return 'phone';
      case 'address': return 'map-marker';
      case 'bloodType': return 'water';
      case 'emergencyContact': return 'card-account-phone';
      default: return 'information';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <Avatar.Text 
          size={100} 
          label={userData.name.substring(0, 2).toUpperCase()} 
          style={[styles.avatar, { backgroundColor: theme.colors.primary }]} 
        />
        <Text variant="headlineSmall" style={styles.name}>
          {userData.name}
        </Text>
        <Text variant="bodyLarge" style={styles.email}>
          {userData.email}
        </Text>
      </Surface>

      <Surface style={styles.section} elevation={2}>
        <Text variant="titleMedium" style={styles.sectionTitle}>Personal Information</Text>
        
        <View style={styles.fieldContainer}>
          <View style={styles.fieldIcon}>
            <IconButton icon={getFieldIcon('name')} iconColor={theme.colors.primary} size={24} />
          </View>
          <View style={styles.fieldContent}>
            <Text variant="labelLarge">Full Name</Text>
            <Text variant="bodyLarge">{userData.name || 'Not provided'}</Text>
          </View>
          <IconButton 
            icon="pencil" 
            iconColor={theme.colors.primary}
            size={20} 
            onPress={() => handleEdit('name')}
          />
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.fieldContainer}>
          <View style={styles.fieldIcon}>
            <IconButton icon={getFieldIcon('phone')} iconColor={theme.colors.primary} size={24} />
          </View>
          <View style={styles.fieldContent}>
            <Text variant="labelLarge">Phone Number</Text>
            <Text variant="bodyLarge">{userData.phone || 'Not provided'}</Text>
          </View>
          <IconButton 
            icon="pencil" 
            iconColor={theme.colors.primary}
            size={20} 
            onPress={() => handleEdit('phone')}
          />
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.fieldContainer}>
          <View style={styles.fieldIcon}>
            <IconButton icon={getFieldIcon('address')} iconColor={theme.colors.primary} size={24} />
          </View>
          <View style={styles.fieldContent}>
            <Text variant="labelLarge">Address</Text>
            <Text variant="bodyLarge">{userData.address || 'Not provided'}</Text>
          </View>
          <IconButton 
            icon="pencil" 
            iconColor={theme.colors.primary}
            size={20} 
            onPress={() => handleEdit('address')}
          />
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.fieldContainer}>
          <View style={styles.fieldIcon}>
            <IconButton 
              icon={getFieldIcon('bloodType')} 
              iconColor="red" 
              size={24} 
            />
          </View>
          <View style={styles.fieldContent}>
            <Text variant="labelLarge">Blood Type</Text>
            <Text variant="bodyLarge">{userData.bloodType || 'Not provided'}</Text>
          </View>
          <IconButton 
            icon="pencil" 
            iconColor={theme.colors.primary}
            size={20} 
            onPress={() => handleEdit('bloodType')}
          />
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.fieldContainer}>
          <View style={styles.fieldIcon}>
            <IconButton icon={getFieldIcon('emergencyContact')} iconColor={theme.colors.primary} size={24} />
          </View>
          <View style={styles.fieldContent}>
            <Text variant="labelLarge">Emergency Contact</Text>
            <Text variant="bodyLarge">{userData.emergencyContact || 'Not provided'}</Text>
          </View>
          <IconButton 
            icon="pencil" 
            iconColor={theme.colors.primary}
            size={20} 
            onPress={() => handleEdit('emergencyContact')}
          />
        </View>
      </Surface>

      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
        buttonColor="#ff4444"
        icon="logout">
        Logout
      </Button>

      <Portal>
        <Modal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text variant="titleMedium" style={styles.modalTitle}>
            Edit {editField && editField.charAt(0).toUpperCase() + editField.slice(1)}
          </Text>
          
          <TextInput
            mode="outlined"
            value={editValue}
            onChangeText={setEditValue}
            style={styles.modalInput}
            autoFocus
          />
          
          <View style={styles.modalButtons}>
            <Button 
              mode="text" 
              onPress={() => setEditModalVisible(false)}
              disabled={savingData}
            >
              Cancel
            </Button>
            <Button 
              mode="contained" 
              onPress={saveField}
              loading={savingData}
              disabled={savingData}
            >
              Save
            </Button>
          </View>
        </Modal>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  avatar: {
    marginBottom: 16,
  },
  name: {
    marginBottom: 4,
    fontWeight: 'bold',
  },
  email: {
    color: '#666666',
  },
  section: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
  },
  sectionTitle: {
    marginBottom: 16,
    fontWeight: 'bold',
  },
  fieldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  fieldIcon: {
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldContent: {
    flex: 1,
    paddingHorizontal: 8,
  },
  divider: {
    marginVertical: 4,
  },
  logoutButton: {
    margin: 16,
    marginBottom: 24,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
});

export default ProfileScreen; 