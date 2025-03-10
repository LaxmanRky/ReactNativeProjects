import { AppRegistry } from 'react-native';
import App from './App';

AppRegistry.registerComponent('DocEase', () => App);
AppRegistry.runApplication('DocEase', {
  rootTag: document.getElementById('root')
});
