/**
 * @format
 */

// Import Firebase config to ensure it's initialized first
import './src/firebase/config';

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

AppRegistry.registerComponent(appName, () => App);
