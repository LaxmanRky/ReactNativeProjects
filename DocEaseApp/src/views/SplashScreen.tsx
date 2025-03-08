import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';

const SplashScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>DocEase</Text>
      <Text style={styles.subtitle}>Patient Management System</Text>
      <ActivityIndicator size="large" color="#3498db" style={styles.loader} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: '#7f8c8d',
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});

export default SplashScreen;
