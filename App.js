import React from 'react';
import { Provider } from 'react-redux';
import { Store } from './redux/store';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import ScreenMain from './screens/ScreenMain';
import ScreenCalendar from './screens/ScreenCalendar';
import ScreenSettings from './screens/ScreenSettings';
import ScreenAddTask from './screens/ScreenAddTask';
import ScreenEditTask from './screens/ScreenEditTask';

const Tab = createBottomTabNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator
          screenOptions={({ route }) => ({
            
            tabBaractiveTintColor: '#f0f',
            tabBarinactiveTintColor: '#555',
            tabBarActiveBackgroundColor: '#fff',
            tabBarInactiveBackgroundColor: '#d2d2d9',
            
            tabBarIcon: ({ focused, size, color }) => {
              let iconName;
              if(route.name === 'Lista zadań') {
                iconName = 'clipboard-list';
                size = focused? 25: 20;
              } 
              else if(route.name === 'Kalendarz') {
                iconName = 'calendar-alt';
                size = focused? 25: 20;
              }
              else if(route.name === 'Ustawienia') {
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
          name="Lista zadań"
          component={ScreenMain}
          options={{
            header: () => null
          }}>
        </Tab.Screen>
        <Tab.Screen
          name="Kalendarz"
          component={ScreenCalendar}
          options={{
            header: () => null
          }}>
        </Tab.Screen>
        <Tab.Screen
          name="Ustawienia"
          component={ScreenSettings}
          options={{
            header: () => null
          }}>
        </Tab.Screen>
      </Tab.Navigator>
  );}

const Stack = createNativeStackNavigator();

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
          name="AddTasks"
          component={ScreenAddTask}
          options={{
            title: 'Nowe zadanie',
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
          name="EditTasks"
          component={ScreenEditTask}
          options={{
            title: 'Edytuj zadanie',
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