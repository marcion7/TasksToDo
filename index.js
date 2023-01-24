import { registerRootComponent } from 'expo';

import App from './App';

import notifee, { EventType } from '@notifee/react-native';

notifee.onBackgroundEvent(async ({ type, detail }) => {
  
    // Sprawdzenie czy użytkownik klinął akcję "Ustaw jako wykonane"
    if (type === EventType.ACTION_PRESS && detail.pressAction.id === 'set-as-done') {
      tasksToSetDone.push(parseInt(detail.notification.id));
    }
  }
);
const tasksToSetDone = [];
exports.tasksToSetDone = tasksToSetDone;

registerRootComponent(App);
