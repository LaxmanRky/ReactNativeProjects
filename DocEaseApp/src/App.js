import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, StatusBar, Platform, View } from 'react-native';
import AppNavigator from './navigation/AppNavigator';
import WebAppNavigator from './navigation/WebAppNavigator';

const App = () => {
  // Add web-specific styles when running on web
  useEffect(() => {
    if (Platform.OS === 'web') {
      // Add global styles to ensure proper rendering on web
      const style = document.createElement('style');
      style.textContent = `
        html, body, #root {
          height: 100%;
          margin: 0;
          padding: 0;
          background-color: #f5f5f5;
          display: flex;
          flex-direction: column;
        }
        
        #root {
          flex: 1;
        }
        
        /* Fix for React Native Web styling issues */
        div[data-testid="root"] {
          height: 100%;
          display: flex;
          flex-direction: column;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  // Use different navigators for web and mobile
  const Navigator = Platform.OS === 'web' ? WebAppNavigator : AppNavigator;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
      <Navigator />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    width: '100%',
    height: '100%',
  },
});

export default App;
