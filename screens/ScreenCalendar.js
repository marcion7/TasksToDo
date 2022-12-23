import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, StatusBar, Alert, SectionList} from 'react-native';
import {Calendar, LocaleConfig} from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { setTaskID, setTasks, groupBy } from '../redux/actions';
import * as Progress from 'react-native-progress';
import {isWhatPercentOf, countDoneTasks, styles, onDeleteNotification} from './ScreenMain';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

export default function ScreenCalendar({ navigation }){

  const { tasks } = useSelector(state => state.taskReducer);
  const { settings } = useSelector(state => state.taskReducer);
  const dispatch = useDispatch();
  const [selectedDay, setSelectedDay] = useState(new Date().toISOString().slice(0,10));

  useEffect(() => {
    getTasks();
  }, [])

  const getTasks = () => {
    AsyncStorage.getItem('Tasks')
    .then(tasks => {
      const parsedTasks = JSON.parse(tasks);
      if (parsedTasks && typeof parsedTasks === 'object'){
        dispatch(setTasks(parsedTasks));
      }
    })
    .catch(err => console.log(err))
  } 

  const showConfirmDialogPL = ( id, title ) =>
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
  );

  const showConfirmDialogEN = ( id, title ) =>
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
  );

  // usuń zadanie
const deleteTask = (id) => {
  const filteredTasks = tasks.filter(task => task.ID !== id);
    AsyncStorage.setItem('Tasks', JSON.stringify(filteredTasks))
      .then(() =>{
        dispatch(setTasks(filteredTasks));
        onDeleteNotification('taskID')
      })
      .catch(err => console.log(err))
  }

  const filterTasks = (selectedDate) => {
    filtered = groupBy(tasks, 'Date');
    if (selectedDate !== ''){
      filtered = Object.fromEntries(Object.entries(filtered).filter(([key]) => key.includes(selectedDate)));
    }
    return Object.keys(filtered).map((key)=> ({key: key, data: filtered[key]}));
  }
  
  const filteredTasks = filterTasks(selectedDay);
  const allTasks = filterTasks('');

  // sortowanie dni chronologicznie
  filteredTasks.sort((a, b) => new Date(a.key).getTime() - new Date(b.key).getTime());
  // sortowanie godzin chronologicznie w kazdym dniu
  for (let i = 0; i < filteredTasks.length; i++){
    filteredTasks[i].data.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
  }

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
    <View style={styles.container}> 
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
        theme={{
          textMonthFontSize: 22,
        }}
        >
       </Calendar>
       <StatusBar barStyle = "auto" />
          {filteredTasks.length == 0 ?
            <Text style={styles.Listazad}>{settings.Language == 1 ? 'Brak zadań w wybranym dniu' : 'There are no tasks on the selected day'}</Text>
          : 
          <SectionList
          renderSectionHeader={ ( {section} ) => (
          <View>
              <Text style={[{fontSize: 20}, styles.Item_date]}>
                {days[new Date(section.key).getDay()]}, {new Date(section.key).getDate()} {months[new Date(section.key).getMonth()]} {new Date(section.key).getFullYear()}
              </Text>
              <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#95cff0'}}>
                <Progress.Bar progress={isWhatPercentOf(countDoneTasks(section.data) , section.data.length)/100} />
              <Text>
                {' '}{countDoneTasks(section.data)}/{section.data.length} ({isWhatPercentOf(countDoneTasks(section.data) , section.data.length)}%)
              </Text>
            </View>
          </View>
          )}
          sections={filteredTasks}
          renderItem={({ item }) => (
          <View>
            <TouchableOpacity
              style={styles.Item}
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
                  <View style={styles.checkbox}>
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
                  color: item.Done === true ? 'gray' : 'black'},
                  styles.ItemTitle]}
                >
                  {item.Title} {item.IsTaskRecc == true
                  ? 
                  <FontAwesome5
                    name = 'sync'
                    size = {20}    
                  />
                  :
                  ''}
                </Text>
                <Text
                  style={[{textDecorationLine: item.Done === true ? 'line-through' : 'none',
                  color: item.Done === true ? 'gray' : 'black'},
                  styles.ItemTitle]}
                >
                  <FontAwesome5
                    name = 'clock'
                    size = {20} /> {item.Date.slice(11,16)}
                </Text>
                <Text
                  style={[{textDecorationLine: item.Done === true ? 'line-through' : 'none',
                  color: item.Done === true ? 'gray' : 'black'},
                  styles.ItemDesc]}
                >
                  {item.Description}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {settings.Language == 1 ? showConfirmDialogPL( item.ID, item.Title ) : showConfirmDialogEN( item.ID, item.Title )}}
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
  