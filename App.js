import React, { useEffect } from 'react';
import { Provider, useSelector } from 'react-redux';
import { Store } from './redux/store';

import { setSettings } from './redux/actions';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import ScreenMain from './screens/ScreenMain';
import ScreenCalendar from './screens/ScreenCalendar';
import ScreenSettings from './screens/ScreenSettings';
import ScreenAddTask from './screens/ScreenAddTask';
import ScreenEditTask from './screens/ScreenEditTask';

import AsyncStorage from '@react-native-async-storage/async-storage';

const Tab = createBottomTabNavigator();

function BottomTabs() {

  const { settings } = useSelector(state => state.taskReducer);

  return (
    <Tab.Navigator
          screenOptions={({ route }) => ({
            
            tabBaractiveTintColor: '#f0f',
            tabBarinactiveTintColor: '#555',
            tabBarActiveBackgroundColor: '#fff',
            tabBarInactiveBackgroundColor: '#d2d2d9',
            
            tabBarIcon: ({ focused, size, color }) => {
              let iconName;
              if(route.name === 'Lista zadań' || route.name === 'Tasks List') {
                iconName = 'clipboard-list';
                size = focused? 25: 20;
              } 
              else if(route.name === 'Kalendarz' || route.name === 'Calendar') {
                iconName = 'calendar-alt';
                size = focused? 25: 20;
              }
              else if(route.name === 'Ustawienia' || route.name === 'Settings') {
                iconName = 'cog';
                size = focused? 25: 20;
              }
            return(
              <FontAwesome5
                name={iconName}
                size={size}
                color={color}
              />
            )
            }
          })}
      >
        <Tab.Screen
          name={settings.Language == 1 ? "Lista zadań" : "Tasks List"}
          component={ScreenMain}
          options={{
            header: () => null
          }}>
        </Tab.Screen>
        <Tab.Screen
          name={settings.Language == 1 ? "Kalendarz" : "Calendar"}
          component={ScreenCalendar}
          options={{
            header: () => null
          }}>
        </Tab.Screen>
        <Tab.Screen
          name={settings.Language == 1 ? "Ustawienia" : "Settings"}
          component={ScreenSettings}
          options={{
            header: () => null
          }}>
        </Tab.Screen>
      </Tab.Navigator>
  );
}

const Stack = createNativeStackNavigator();

const Settings = AsyncStorage.getItem('Settings');


function App() {

  return (
  <Provider store={Store}>
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={BottomTabs}
          options={{
            header: () => null
          }}
        />
          <Stack.Screen
          name='AddTasks'
          component={ScreenAddTask}
          options={{
            headerStyle: {
              backgroundColor: '#0b146b',
              fontFace: 'tahoma'
            },
            headerTitleStyle: {
              color: 'white'
            },
            headerTintColor: 'white'
          }}
        />
        <Stack.Screen
          name='EditTasks'
          component={ScreenEditTask}
          options={{
            headerStyle: {
              backgroundColor: '#0b146b',
              fontFace: 'tahoma'
            },
            headerTitleStyle: {
              color: 'white'
            },
            headerTintColor: 'white'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  </Provider>
  );
}

export default App;