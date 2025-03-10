const path = require('path');

module.exports = {
  // Add webpack aliases to handle React Native Firebase modules in web
  resolve: {
    alias: {
      // Provide empty implementations for React Native specific modules
      'react-native/Libraries/Utilities/binaryToBase64': path.resolve(__dirname, 'src/config/firebase.mock.js'),
      'react-native/Libraries/vendor/emitter/EventEmitter': path.resolve(__dirname, 'src/config/firebase.mock.js'),
      '@react-native-firebase/app': path.resolve(__dirname, 'src/config/firebase.mock.js'),
      '@react-native-firebase/auth': path.resolve(__dirname, 'src/config/firebase.mock.js')
    },
    fallback: {
      // Provide polyfills for Node.js core modules
      "fs": false,
      "path": require.resolve("path-browserify"),
      "os": require.resolve("os-browserify/browser"),
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer/")
    }
  }
};
