import { registerRootComponent } from 'expo';

import App from './App';

import React, { useEffect, useState } from 'react';
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
    // Check if the user pressed the "Mark as read" action
    else if (type === EventType.ACTION_PRESS && detail.pressAction.id === 'set-as-done') {
      tasksToSetDone.push(parseInt(detail.notification.id));
    }
  }
);
export const tasksToSetDone = [];

registerRootComponent(App);
