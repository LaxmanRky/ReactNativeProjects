module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    // Add any additional babel plugins here if needed
  ],
  env: {
    production: {
      plugins: ['react-native-paper/babel'],
    },
  },
};
