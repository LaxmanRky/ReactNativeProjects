import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const TestComponent = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>DocEase Test Component</Text>
      <Text style={styles.subtitle}>If you can see this, React Native Web is working!</Text>
      <View style={styles.buttonContainer}>
        <Button 
          title="Test Button" 
          onPress={() => alert('Button pressed!')} 
        />
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
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#3498db',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  buttonContainer: {
    marginTop: 20,
    width: '80%',
    maxWidth: 300,
  },
});

export default TestComponent;
