import { registerRootComponent } from 'expo';

import App from './App';

import notifee, { EventType } from '@notifee/react-native';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately

notifee.onBackgroundEvent(async ({ type, detail }) => {
  
    // Check if the user pressed the "set-as-done" action
    if (type === EventType.ACTION_PRESS && detail.pressAction.id === 'set-as-done') {
      tasksToSetDone.push(parseInt(detail.notification.id));
    }
  }
);
const tasksToSetDone = [];
exports.tasksToSetDone = tasksToSetDone;

registerRootComponent(App);
