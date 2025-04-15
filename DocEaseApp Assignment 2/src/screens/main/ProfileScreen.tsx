import React from 'react';
import {StyleSheet, ScrollView} from 'react-native';
import {
  Text,
  Avatar,
  List,
  Button,
  Surface,
  Divider,
} from 'react-native-paper';

interface ProfileScreenProps {
  navigation: any;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({navigation}) => {
  const handleLogout = () => {
    // TODO: Implement logout logic
    navigation.replace('Login');
  };

  return (
    <ScrollView style={styles.container}>
      <Surface style={styles.header} elevation={2}>
        <Avatar.Icon size={80} icon="account" style={styles.avatar} />
        <Text variant="headlineSmall" style={styles.name}>
          John Doe
        </Text>
        <Text variant="bodyLarge" style={styles.email}>
          john.doe@example.com
        </Text>
      </Surface>

      <Surface style={styles.section} elevation={2}>
        <List.Section>
          <List.Subheader>Personal Information</List.Subheader>
          <List.Item
            title="Edit Profile"
            left={props => <List.Icon {...props} icon="account-edit" />}
          />
          <List.Item
            title="Medical History"
            left={props => <List.Icon {...props} icon="file-document" />}
          />
          <List.Item
            title="Insurance Information"
            left={props => <List.Icon {...props} icon="shield-check" />}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Appointments</List.Subheader>
          <List.Item
            title="Upcoming Appointments"
            left={props => <List.Icon {...props} icon="calendar-clock" />}
          />
          <List.Item
            title="Past Appointments"
            left={props => <List.Icon {...props} icon="calendar-check" />}
          />
          <List.Item
            title="Medical Records"
            left={props => <List.Icon {...props} icon="folder-medical" />}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <List.Subheader>Settings</List.Subheader>
          <List.Item
            title="Notifications"
            left={props => <List.Icon {...props} icon="bell" />}
          />
          <List.Item
            title="Privacy Settings"
            left={props => <List.Icon {...props} icon="shield-lock" />}
          />
          <List.Item
            title="Help & Support"
            left={props => <List.Icon {...props} icon="help-circle" />}
          />
        </List.Section>
      </Surface>

      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.logoutButton}
        buttonColor="#ff4444">
        Logout
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    marginBottom: 16,
  },
  avatar: {
    marginBottom: 16,
    backgroundColor: '#6200ee',
  },
  name: {
    marginBottom: 4,
  },
  email: {
    color: '#666666',
  },
  section: {
    margin: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
  },
  logoutButton: {
    margin: 16,
  },
});

export default ProfileScreen; 