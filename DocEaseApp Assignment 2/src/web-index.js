import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import TestComponent from './components/TestComponent';

// This is a simplified entry point for the web version
const WebApp = () => {
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5'
    }}>
      <TestComponent />
    </div>
  );
};

// Create root and render
const container = document.getElementById('root');
const root = createRoot(container);
root.render(<WebApp />);
