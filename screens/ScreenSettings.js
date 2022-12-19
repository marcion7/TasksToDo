import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, TouchableOpacity } from 'react-native';
import ToggleSwitch from 'toggle-switch-react-native';


import {styles} from './ScreenEditTask';
export default function ScreenSettings(){

  const [value, setValue] = useState('uk');

  const [theme, dark] = useState(false);

  const [selected, setSelected] = useState("");
  const data = [
    {key:'1',value:'24'},
    {key:'2',value:'12'}
  ];

  const changeTheme = () => {
    dark(current => !current);
  };
   
    return(
    <View style={theme == false ? styles.container : styles.containerDark}>
      <Text style={stylesSettings.Header}>Ustawienia</Text>
      <View style={stylesSettings.Theme}>
      <ToggleSwitch
        isOn={theme}
        onColor="blue"
        offColor="black"
        label="Motyw Ciemny"
        size='large'
        labelStyle={{ fontSize: 25 }}
        onToggle={changeTheme}
      />
      </View>
    </View>
    )
  }

  const stylesSettings = StyleSheet.create({
    containerB: {
      marginTop: 10,
      height: '100%',
      flexDirection: 'row', 
      justifyContent: 'flex-end'
    },
    Header: {
      color: '#ffffff',
      backgroundColor: '#0b146b',
      fontSize: 20,
      fontFace: 'tahoma',
      padding: 15,
      fontWeight: '500'
    },
    Theme: {
      fontSize: 20,
      marginTop: 20,
      alignItems: 'center',
    },
    Format: {
      fontSize: 25,
      marginTop: 20,
      alignItems: 'center',
    }
  });
  