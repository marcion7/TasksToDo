import React, { useState } from 'react';
import { Text, View, TouchableOpacity, StatusBar, Alert, SectionList} from 'react-native';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { setTaskID, setTasks } from '../redux/actions';
import * as Progress from 'react-native-progress';
import {isWhatPercentOf, countDoneTasks, onDeleteNotification, groupByDate} from './ScreenMain';
import { styles } from '../GlobalStyle';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

export default function ScreenCalendar({ navigation }){

  const { tasks } = useSelector(state => state.taskReducer);
  const { settings } = useSelector(state => state.taskReducer);
  const dispatch = useDispatch();
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().slice(0,10));

  // alert o usuwaniu zadania
  const showConfirmDialog = ( id, title, isrecc, reccid ) => {
    if(isrecc == false){
        {settings.Language == 1 ? 
        Alert.alert(
        "Czy chcesz usunąć to zadanie?",
        title,
        [
          {
            text: "TAK",
            onPress: () => {deleteTask(id)},
            style: "cancel"
          },
          { text: "NIE" }
        ]
      )
      :
      Alert.alert(
        "Do you want to delete this task?",
        title,
        [
          {
            text: "YES",
            onPress: () => {deleteTask(id)},
            style: "cancel"
          },
          { text: "NO" }
        ]
      );}
    }
    else{
      {settings.Language == 1 ? 
        Alert.alert(
        "Czy chcesz usunąć to zadanie cykliczne?",
        title,
        [
          {
            text: "TAK, WSZYSTKIE",
            onPress: () => {deleteTask(id, reccid)},
          },
          {
            text: "TYLKO TE",
            onPress: () => {deleteTask(id)},
            style: "cancel"
          },
          { text: "NIE" }
        ]
      )
      :
      Alert.alert(
        "Do you want to delete this reccuring task?",
        title,
        [
          {
            text: "YES, ALL",
            onPress: () => {deleteTask(id, reccid)},
          },
          {
            text: "ONLY THIS",
            onPress: () => {deleteTask(id)},
            style: "cancel"
          },
          { text: "NO" }
        ]
      );}  
    }
  }
    
    // usuń zadanie
    const deleteTask = (id, reccID=null) => {
      if(reccID == null){
        const filteredTasks = tasks.filter(task => task.ID !== id);
        AsyncStorage.setItem('Tasks', JSON.stringify(filteredTasks))
          .then(() =>{
              onDeleteNotification(id.toString())
              dispatch(setTasks(filteredTasks));
            }
          )
          .catch(err => console.log(err))
      }
      else{
        const reccTasksWithSameID = tasks.filter(task => task.TaskReccID === reccID);
        for(let i = 0; i < reccTasksWithSameID.length; i++){
          onDeleteNotification(reccTasksWithSameID[i].ID.toString())
        }
        const filteredTasks = tasks.filter(task => task.TaskReccID !== reccID);
        AsyncStorage.setItem('Tasks', JSON.stringify(filteredTasks))
        .then(() =>{
          dispatch(setTasks(filteredTasks));
        }
      )
      .catch(err => console.log(err))
      }
  }

  const filterTasks = (selectedDate) => {
    filtered = groupByDate(tasks);
    if (selectedDate !== ''){
      filtered = Object.fromEntries(Object.entries(filtered).filter(([key]) => key.includes(selectedDate)));
    }
    return Object.keys(filtered).map((key)=> ({key: key, data: filtered[key]}));
  }
  
  const filteredTasks = filterTasks(selectedDay);
  const allTasks = filterTasks('');

  const priorityHigh = {color: 'red'}
  const priorityMedium = {color: 'yellow'}
  const priorityLow = {color: '#00fc65'}

  let DaysToMark = {}
  for (const [key, values] of Object.entries(allTasks)) {
    let dotsArray = []
    for (var i = 0; i < values.data.length; i++){
      if (values.data[i].Priority == 1)
        dotsArray.push(priorityLow)
      else if (values.data[i].Priority == 2)
        dotsArray.push(priorityMedium)
      else if (values.data[i].Priority == 3)
        dotsArray.push(priorityHigh)
      else
        continue;
    }
    DaysToMark[values.key] = {selected: true, 
    dots: dotsArray,
    selectedColor: countDoneTasks(values.data)==values.data.length ? '#0d7028' :countDoneTasks(values.data)==0 ? '#75040d' : '#ccde09'}
  }
  DaysToMark[selectedDay] = {selected: true, selectedColor: 'blue'}

LocaleConfig.locales['pl'] = {
  monthNames: [
    'Styczeń',
    'Luty',
    'Marzec',
    'Kwiecień',
    'Maj',
    'Czerwiec',
    'Lipiec',
    'Sierpień',
    'Wrzesień',
    'Październik',
    'Listopad',
    'Grudzień'
  ],
  monthNamesShort: ['Sty.', 'Luty', 'Marz.', 'Kwie.', 'Maj', 'Czer.', 'Lip.', 'Sie.', 'Wrze.', 'Paź.', 'Lis.', 'Gru.'],
  dayNames: ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'],
  dayNamesShort: ['Pon.', 'Wt.', 'Śr.', 'Czw.', 'Pią.', 'Sob.', 'Nie.'],
  today: "Dzisiaj"
};

LocaleConfig.locales['en'] = {
  monthNames: [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December'
  ],
  monthNamesShort: ['Jan.', 'Feb', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'],
  dayNames: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  dayNamesShort: ['Mon.', 'Tue.', 'Wed.', 'Thu.', 'Fri.', 'Sat.', 'Sun.'],
  today: "Today"
};

{settings.Language == 1 ? LocaleConfig.defaultLocale = 'pl' : LocaleConfig.defaultLocale = 'en'};

if (settings.Language == 1){
  var days = ['Niedziela','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota'];
  var months = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
}
else{
  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];   
}
   
    return(
      <View style={settings.DarkMode == false ? styles.container : styles.container_Dark}>
      <Text style={styles.Header}>{settings.Language == 1 ? 'Kalendarz' : 'Calendar'}</Text>
       <Calendar
        enableSwipeMonths={true}
        context={{ date : '' }}
        onDayPress={day => {
          setSelectedDay(day.dateString);
        }}
        markingType={'multi-dot'}
        markedDates={DaysToMark}
        firstDay={1}
        theme={
        settings.DarkMode == false ? styles.CalendarStyle : styles.CalendarStyle_Dark
        }
        key={settings.DarkMode}
        >
       </Calendar>
       <StatusBar barStyle = "auto" />
          {filteredTasks.length == 0 ?
            <Text style={styles.FilterErrorText}>{settings.Language == 1 ? 'Brak zadań w wybranym dniu' : 'There are no tasks on the selected day'}</Text>
          : 
          <SectionList
          renderSectionHeader={ ( {section} ) => (
          <View>
             <Text style={{fontSize: 20, textAlign: 'center', backgroundColor: settings.DarkMode == false ? '#95cff0' : '#03032b', color: settings.DarkMode == false ? 'black' : 'white'}}>
                {days[new Date(section.key).getDay()]}, {new Date(section.key).getDate()} {months[new Date(section.key).getMonth()]} {new Date(section.key).getFullYear()}
              </Text>
              <View style={{textAlign: 'center', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: settings.DarkMode == false ? '#95cff0' : '#03032b', color: settings.DarkMode == false ? 'black' : 'white'}}>
                <Progress.Bar progress={isWhatPercentOf(countDoneTasks(section.data) , section.data.length)/100} />
                <Text style={{color: settings.DarkMode == false ? 'black' : 'white'}}>
                {' '}{countDoneTasks(section.data)}/{section.data.length} ({isWhatPercentOf(countDoneTasks(section.data) , section.data.length)}%)
              </Text>
            </View>
          </View>
          )}
          sections={filteredTasks}
          renderItem={({ item }) => (
          <View>
            <TouchableOpacity
              style={settings.DarkMode == false ? styles.Item : styles.Item_Dark}
              onPress={()=>{
                  dispatch(setTaskID(item.ID));
                  navigation.navigate('EditTasks');
                }
              }
            >
            <View style={styles.Item_row}>
            <View style={{height: '100%', width: '5%', borderTopLeftRadius: 5, borderBottomLeftRadius: 5, marginRight: 5, 
              backgroundColor: 
                item.Priority === 1 ? '#60f777' :
                item.Priority === 2 ? '#eff22c' :
                item.Priority === 3 ? 'red' :
                '#f0f7ff'}}>
            </View>
                  <View style={{paddingRight: '3%'}}>
                    {item.Done == true
                      ? 
                      <FontAwesome5
                        name = 'check-circle'
                        size = {25}
                        color = 'green'   
                      />
                      :
                      ''}
                  </View>
              <View style={styles.Item_body}>
                <Text
                  style={[{textDecorationLine: item.Done === true ? 'line-through' : 'none',
                  color: item.Done === true ? 'gray' : settings.DarkMode == false ? 'black' : 'white'},
                  styles.ItemTitle]}
                >
                  {item.Title} {item.IsTaskRecc == true
                  ? 
                  <FontAwesome5
                    name = 'sync'
                    size = {20}
                    color = {settings.DarkMode == false ? 'black' : 'white'} 
                  />
                  :
                  ''}
                </Text>
                <Text
                  style={[{textDecorationLine: item.Done === true ? 'line-through' : 'none',
                  color: item.Done === true ? 'gray' : settings.DarkMode == false ? 'black' : 'white'},
                  styles.ItemTitle]}
                >
                  <FontAwesome5
                    name = 'bell'
                    size = {20} /> {item.Date.slice(11,16)}
                </Text>
                <Text
                  style={[{textDecorationLine: item.Done === true ? 'line-through' : 'none',
                  color: item.Done === true ? 'gray' : settings.DarkMode == false ? 'black' : 'white'},
                  styles.ItemDesc]}
                >
                  {item.Description}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => showConfirmDialog( item.ID, item.Title, item.IsTaskRecc, item.TaskReccID )}
              >
                  <FontAwesome5
                    name = 'trash-alt'
                    size = {30}
                    color = 'red'
                  />
              </TouchableOpacity>
            </View>
            </TouchableOpacity>
            </View>
          )}
          keyExtractor={(item, index) => index.toString()}
          />
        }
    </View>
    )
  }
  