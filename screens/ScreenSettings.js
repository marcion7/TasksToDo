import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image } from 'react-native';
import ToggleSwitch from 'toggle-switch-react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { useDispatch, useSelector } from 'react-redux';
import { setSettings } from '../redux/actions';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { styles }from '../GlobalStyle';

export default function ScreenSettings(){
  
  const { settings } = useSelector(state => state.taskReducer);
  const dispatch = useDispatch();

  const [darkMode, setDarkMode] = useState(false);

  const [language, setLanguage] = useState(1);
  const [showlanguage, setShowLanguage] = useState(false);

  useEffect(() => {
    updateSettings();
  }, [])

  const updateSettings = () => {
    if(settings.Language != null && settings.DarkMode != null){
      setDarkMode(settings.DarkMode);
      setLanguage(settings.Language);
    }
  }

  const changeTheme = () => {
    setDarkMode(current => !current);
  };

  const LanguageOptions = [
    {
      label: 'PL',
      value: 1,
      icon: () => <Image source={require('../Icons/pl.png')} style={styles.iconStyle} />
    },
    {
      label: 'EN',
      value: 2,
      icon: () => <Image source={require('../Icons/en.png')} style={styles.iconStyle} />
    },
    ]

    const setSetting = () => {
      try{
        var Settings = {
          DarkMode: darkMode,
          Language: language,
        }
        AsyncStorage.setItem('Settings', JSON.stringify(Settings))
        .then(() => {
          dispatch(setSettings(Settings));
        })
        .catch(err => console.log(err))
      }
      catch(error){
        console.log(error);
      }
    }
   
    return(
    <View style={settings.DarkMode == false ? styles.container : styles.container_Dark}>
      <Text style={stylesSettings.Header}>{settings.Language == 1 ? 'Ustawienia' : 'Settings'}</Text>
        <View style={stylesSettings.Theme}>
          <ToggleSwitch
            isOn={darkMode}
            onColor="blue"
            offColor={darkMode == false ? 'grey' : 'black'}
            label={settings.Language == 1 ? "Motyw Ciemny" : "Dark Mode"}
            size='large'
            labelStyle={{ fontSize: 25, color: settings.DarkMode==false ? 'black' : 'white' }}
            onToggle={changeTheme}
          />
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={{fontSize: 25, marginTop: 10, marginRight: 10, color: settings.DarkMode==false ? 'black' : 'white'  }}>{settings.Language == 1 ? "Język" : "Language"}</Text>
            <DropDownPicker
              containerStyle={{width: '30%', marginTop: 10}}
              open={showlanguage}
              value={language}
              items={LanguageOptions}
              setOpen={setShowLanguage}
              setValue={setLanguage}
              theme={settings.DarkMode == false ? "LIGHT" : "DARK"}
            />
          </View>
          <View style={styles.Buttons}>
            <TouchableOpacity 
              style={styles.EditTask}
              onPress={darkMode != settings.DarkMode || language != settings.Language ? setSetting : null}
              >
              <Text style={styles.ButtonAdd}>{settings.Language == 1 ? 'Zapisz' : 'Save'}</Text>
            </TouchableOpacity>
      </View>
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
      fontWeight: '500',
    },
    TaskRepeatLabel: {
      fontWeight: 'bold',
      fontSize: 20,
      marginTop: 10,
      marginLeft: 10,
      width: '25%'
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
  