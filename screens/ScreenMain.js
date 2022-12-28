import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { Text, View, TouchableOpacity, StatusBar, Alert, SectionList, Button } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setTaskID, setTasks, groupBy, setSettings } from '../redux/actions';
import { Picker } from '@react-native-picker/picker';
import * as Progress from 'react-native-progress';
import notifee from '@notifee/react-native';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { styles }from '../GlobalStyle';

// usuń powiadomienie
export async function onDeleteNotification(notificationId) {
  await notifee.cancelNotification(notificationId);
}

// policz wykonanie zadania w danym dniu
export function countDoneTasks(tasks){
  var counter = 0;
  for (let i = 0; i < tasks.length; i++) {
     if (tasks[i].Done == true) {
         counter++;
     }
   }
   return counter;
 };
 
 // jakim procentem liczby B jest A
 export const isWhatPercentOf = (numA, numB) => {
   return Math.round((numA / numB) * 100);
 }

 // funkcja do wybierania następnego id dla Tasku
export const setNextID = (array) => {
  const ids = new Set()
  for (let i = 0; i < array.length; i++) {
    ids.add(array[i].ID);
  }

  var id = 1
  for (let i = 0; i < ids.size; i++){
    if (ids.has(id)){
      id++;
    }
    else{
      ids.add(id);
      break;
    }
  }
 // console.log(array)
  return id;
}

export default function ScreenMain( {navigation} ){

  const { tasks } = useSelector(state => state.taskReducer);
  const { settings } = useSelector(state => state.taskReducer);
  const dispatch = useDispatch();

  const [showFilters, setShowFilters] = useState(false);
  const [FilterPriority, setFilterPriority] = useState('');
  const [FilterDone, setFilterDone] = useState('');
  const [TasksDateFilterIndex, setTasksDateFilterIndex] = useState(1);

  useEffect(() => {
    getTasks();
    getSettings();
  }, [])

//co minute pobieraj zadania
/*  setInterval(function() {
    getTasks();
}, 60 * 1000); // 60 * 1000 milsec
*/

if (settings.Language == 1){
  var days = ['Niedziela','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota'];
  var months = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];
}
else{
  var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];   
}

// pobierz ustawienia
const getSettings = () => {
  AsyncStorage.getItem('Settings')
  .then(settings => {
    const parsedSettings = JSON.parse(settings);
    if (parsedSettings != null){
      dispatch(setSettings(parsedSettings));
    }
    else{
      const defaultSettings = JSON.stringify({DarkMode: false, Language: 1});
      const parsedSettings = JSON.parse(defaultSettings);
      dispatch(setSettings(parsedSettings))
    }
  })
  .catch(err => console.log(err))
}

// pobierz zadania
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

const showConfirmDialog = ( id, title ) =>
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
);
}

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

 const filterTasks = () => {
  if(FilterPriority !== '' && FilterDone !== '')
    filtered = groupBy(tasks.filter(task => task.Done === FilterDone && task.Priority === FilterPriority), 'Date')
  else if(FilterPriority !== '')
    filtered = groupBy(tasks.filter(task => task.Priority === FilterPriority), 'Date');
  else if(FilterDone !== '')
    filtered = groupBy(tasks.filter(task => task.Done === FilterDone), 'Date');
  else
    filtered = groupBy(tasks, 'Date');
  return Object.keys(filtered).map((key)=> ({key: key, data: filtered[key]}));
}

 const filteredTasks = filterTasks();

 // sortowanie dni chronologicznie
 filteredTasks.sort((a, b) => new Date(a.key).getTime() - new Date(b.key).getTime());
 // sortowanie godzin chronologicznie w kazdym dniu
for (let i = 0; i < filteredTasks.length; i++){
  filteredTasks[i].data.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());
 }

 var activeTasks = []
 for (let i = 0; i < filteredTasks.length; i++){
   var a = filteredTasks[i].data
   for (let i = 0; i < a.length; i++){
     if (new Date(a[i].Date).getTime() > new Date(Date.now() + 3600000)){
      activeTasks.push(a[i])
     }
   }
  }

  activeTasks = groupBy(activeTasks, 'Date')
  activeTasks = Object.keys(activeTasks).map((key)=> ({key: key, data: activeTasks[key]}))

  var oldTasks = []
  for (let i = 0; i < filteredTasks.length; i++){
    var a = filteredTasks[i].data
    for (let i = 0; i < a.length; i++){
      if (new Date(a[i].Date).getTime() < new Date(Date.now() + 3600000)){
        oldTasks.push(a[i])
      }
    }
   }

   oldTasks = groupBy(oldTasks, 'Date')
   oldTasks = Object.keys(oldTasks).map((key)=> ({key: key, data: oldTasks[key]}))

  function setSelectedTasks (){
   switch (TasksDateFilterIndex) {
    case 0:
      return filteredTasks;
    case 1:
      return activeTasks;
    case 2:
      return oldTasks;
    default:
      return activeTasks;
  }
}


    return(
    <View style={settings.DarkMode == false ? styles.container : styles.container_Dark}>
      <StatusBar barStyle = "auto" />
      <Text style={styles.Header}>{settings.Language == 1 ? 'Lista zadań' : 'Tasks List'}</Text>
        <View style={{ height: "91%" }}>
          <View style={[styles.taskDateFilter_bar, {display: showFilters==false ? 'none' : 'flex'}]}>
            <TouchableOpacity
                style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: TasksDateFilterIndex==0 ? '#01632a' : '#060554'}}
                onPress={() => {setTasksDateFilterIndex(0)}}
            >
            <Text style={styles.TaskDateFilterText}>{settings.Language == 1 ? 'Wszystkie' : 'All'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
                style={{flex: 1, justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderRightWidth: 1, backgroundColor: TasksDateFilterIndex==1 ? '#01632a' : '#060554'}}
                onPress={() => {setTasksDateFilterIndex(1)}}
            >
            <Text style={styles.TaskDateFilterText}>{settings.Language == 1 ? 'Aktualne' : 'Current'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
                style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: TasksDateFilterIndex==2 ? '#01632a' : '#060554'}}
                onPress={() => {setTasksDateFilterIndex(2)}}
            >
            <Text style={styles.TaskDateFilterText}>{settings.Language == 1 ? 'Archiwalne' : 'Archival'}</Text>
            </TouchableOpacity>
          </View>
          <View style={{backgroundColor: '#03368a', flexDirection: 'row', display: showFilters==false ? 'none' : 'flex'}}>
            <Text style={styles.filterText}>{settings.Language == 1 ? 'Priorytet' : 'Priority'}</Text>
              <Picker
                selectedValue={FilterPriority}
                onValueChange={(itemValue, itemIndex) =>
                  setFilterPriority(itemValue)
                }
                mode='dropdown'
                style={{minWidth: '75%', color: 'white'}}
                dropdownIconColor = 'white'
                >
                <Picker.Item label= {settings.Language == 1 ? 'Wszystkie' : 'All'} value='' />
                <Picker.Item label= {settings.Language == 1 ? 'Niski' : 'Low'} value={1} />
                <Picker.Item label= {settings.Language == 1 ? 'Średni' : 'Medium'} value={2} />
                <Picker.Item label= {settings.Language == 1 ? 'Wysoki' : 'High'} value={3} />
              </Picker>
          </View>
          <View style={{backgroundColor: '#03368a', flexDirection: 'row', display: showFilters==false ? 'none' : 'flex'}}>
            <Text style={styles.filterText}>Status</Text> 
              <Picker
                selectedValue={FilterDone}
                onValueChange={(itemValue, itemIndex) =>
                  setFilterDone(itemValue)
                }
                mode='dropdown'
                style={{minWidth: '75%', color: 'white'}}
                dropdownIconColor = 'white'
                >
                <Picker.Item label= {settings.Language == 1 ? 'Wszystkie' : 'All'} value='' />
                <Picker.Item label= {settings.Language == 1 ?'Nieukończone' : 'Undone'} value={false} />
                <Picker.Item label= {settings.Language == 1 ? 'Ukończone' : 'Done'} value={true} />
              </Picker>
          </View>
            <View>
              <TouchableOpacity style={{backgroundColor: '#060554', alignItems: 'center'}} onPress={() => setShowFilters(!showFilters)}>
                <Text style={{color: 'white'}}>{settings.Language == 1 ? 'FILTRUJ' : 'FILTER'} {showFilters == true ? <FontAwesome5
                        name = 'caret-up'
                        size = {20}
                        color = 'white'   
                      /> 
                :
                <FontAwesome5
                        name = 'caret-down'
                        size = {20}
                        color = 'white'   
                      />}
                </Text>
              </TouchableOpacity>
            </View>
        {filteredTasks.length == 0 ?
          <Text style={styles.FilterErrorText}>{settings.Language == 1 ? 'Lista zadań jest pusta' : 'Tasks list is empty'}</Text>
        : setSelectedTasks(TasksDateFilterIndex).length == 0 ?
          <Text style={styles.FilterErrorText}>{settings.Language == 1 ? 'Brak zadań o podanych kryteriach' : 'There are no tasks with the given criteria'}</Text>
        :
        <SectionList
          renderSectionHeader={ ( {section} ) => (
          <View>
              <Text style={{fontSize: 20, textAlign: 'center', backgroundColor: settings.DarkMode == false ? '#95cff0' : '#03032b', color: settings.DarkMode == false ? 'black' : 'white'}}>
                {days[new Date(section.key).getDay()]}, {new Date(section.key).getDate()} {months[new Date(section.key).getMonth()]} {new Date(section.key).getFullYear()}
              </Text>
              <View style={{textAlign: 'center', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: settings.DarkMode == false ? '#95cff0' : '#03032b', color: settings.DarkMode == false ? 'black' : 'white'}}>
                <Progress.Bar progress={isWhatPercentOf(countDoneTasks(section.data) , section.data.length)/100} />
              <Text style={{color: settings.DarkMode == true ? 'white' : 'black'}}>
                {' '}{countDoneTasks(section.data)}/{section.data.length} ({isWhatPercentOf(countDoneTasks(section.data) , section.data.length)}%)
              </Text>
            </View>
          </View>
          )}
          sections={setSelectedTasks(TasksDateFilterIndex)}
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
                    name = 'clock'
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
                onPress={() => showConfirmDialog( item.ID, item.Title )}
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
        <TouchableOpacity style={styles.AddButton}
          onPress={() => {
            dispatch(setTaskID(setNextID(tasks)));
            navigation.navigate('AddTasks')}
          }
          >
          <Text style={styles.plus}>+</Text>
        </TouchableOpacity>
    </View>
  )
}