import { AppRegistry, Platform } from 'react-native';
import React from 'react';
import App from './App';
import appJson from './app.json';
const appName = appJson.name;

AppRegistry.registerComponent(appName, () => App);

if (Platform.OS === 'web') {
  const rootTag = document.getElementById('root');
  
  const style = document.createElement('style');
  style.textContent = `
    html, body, #root {
      height: 100%;
      margin: 0;
      padding: 0;
      background-color: #f5f5f5;
      display: flex;
      flex: 1;
    }
    
    div[data-testid="root"] {
      height: 100%;
      display: flex;
      flex: 1;
    }
    
    div {
      display: flex;
      flex-direction: column;
    }
  `;
  document.head.appendChild(style);
  
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;
  
  console.log = function() {
    const logMessage = Array.from(arguments).join(' ');
    document.getElementById('root').setAttribute('data-last-log', logMessage);
    originalConsoleLog.apply(console, arguments);
  };
  
  console.error = function() {
    const errorMessage = Array.from(arguments).join(' ');
    document.getElementById('root').setAttribute('data-last-error', errorMessage);
    originalConsoleError.apply(console, arguments);
  };
  
  try {
    AppRegistry.runApplication(appName, {
      rootTag,
      initialProps: {
        style: {
          display: 'flex',
          flex: 1,
          height: '100%'
        }
      }
    });
    
    console.log('Application started successfully');
  } catch (error) {
    console.error('Error starting application:', error);
  }
  
  window.addEventListener('error', function(event) {
    console.error('Uncaught error:', event.error ? event.error.message : event.message);
  });
  
  window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
  });
}
