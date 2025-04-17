import React, { useEffect } from 'react';
import { View, Image, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { NavigationProp } from '@react-navigation/native';

interface SplashScreenProps {
  navigation: NavigationProp<any>;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  const { isLoggedIn, loading } = useAuth();

  useEffect(() => {
    // Simulate a loading time
    const timeout = setTimeout(() => {
      if (isLoggedIn) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Main' }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      }
    }, 2000);

    return () => clearTimeout(timeout);
  }, [isLoggedIn, navigation, loading]);

  return (
    <View style={styles.container}>
      <Image 
        source={require('../assets/logo.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>DocEase</Text>
      <Text style={styles.tagline}>Your Health, Our Priority</Text>
      <ActivityIndicator style={styles.loading} size="large" color="#4a90e2" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4a90e2',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
  },
  loading: {
    marginTop: 20,
  },
});

export default SplashScreen; 