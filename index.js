import { registerRootComponent } from 'expo';

import App from './App';

import notifee, { EventType } from '@notifee/react-native';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately

notifee.onBackgroundEvent(async ({ type, detail }) => {
  
    // Check if the user pressed the "Mark as read" action
    if (type === EventType.ACTION_PRESS && detail.pressAction.id === 'mark-as-read') {
      // Remove the notification
      await notifee.cancelNotification(detail.notification.id);
    }
  });

registerRootComponent(App);
