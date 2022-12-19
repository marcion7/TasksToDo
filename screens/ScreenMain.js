import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, Alert, SectionList, Button } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { setTaskID, setTasks, groupBy } from '../redux/actions';
import { Picker } from '@react-native-picker/picker';
import * as Progress from 'react-native-progress';
import notifee from '@notifee/react-native';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

//import theme from './ScreenSettings';

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

//export var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
//export var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
 export var days = ['Niedziela','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota'];
 export var months = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];

export default function ScreenMain( {navigation} ){

  const { tasks, taskID } = useSelector(state => state.taskReducer);
  const dispatch = useDispatch();

  const [showFilters, setShowFilters] = useState(false);
  const [FilterPriority, setFilterPriority] = useState('');
  const [FilterDone, setFilterDone] = useState('');
  const [TasksDateFilterIndex, setTasksDateFilterIndex] = useState(1);

  useEffect(() => {
    getTasks();
  }, [])

//co minute pobieraj zadania
/*  setInterval(function() {
    getTasks();
}, 60 * 1000); // 60 * 1000 milsec
*/

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

  function setSelectedTasks (id){
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
    <View style={styles.container}>
      <StatusBar barStyle = "auto" />
      <Text style={styles.Header}>Lista zadań</Text>
        <View style={{ height: "91%" }}>
          <View style={[styles.taskDateFilter_bar, {display: showFilters==false ? 'none' : 'flex'}]}>
            <TouchableOpacity
                style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: TasksDateFilterIndex==0 ? '#01632a' : '#060554'}}
                onPress={() => {setTasksDateFilterIndex(0)}}
            >
            <Text style={styles.TaskDateFilterText}>Wszystkie</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
                style={{flex: 1, justifyContent: 'center', alignItems: 'center', borderLeftWidth: 1, borderRightWidth: 1, backgroundColor: TasksDateFilterIndex==1 ? '#01632a' : '#060554'}}
                onPress={() => {setTasksDateFilterIndex(1)}}
            >
            <Text style={styles.TaskDateFilterText}>Aktualne</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
                style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: TasksDateFilterIndex==2 ? '#01632a' : '#060554'}}
                onPress={() => {setTasksDateFilterIndex(2)}}
            >
            <Text style={styles.TaskDateFilterText}>Archiwalne</Text>
            </TouchableOpacity>
          </View>
          <View style={{backgroundColor: '#03368a', flexDirection: 'row', display: showFilters==false ? 'none' : 'flex'}}>
            <Text style={styles.filterText}>Priorytet</Text>
              <Picker
                selectedValue={FilterPriority}
                onValueChange={(itemValue, itemIndex) =>
                  setFilterPriority(itemValue)
                }
                mode='dropdown'
                style={{minWidth: '75%', color: 'white'}}
                dropdownIconColor = 'white'
                >
                <Picker.Item label= 'Wszystkie' value='' />
                <Picker.Item label= 'Niski' value={1} />
                <Picker.Item label= 'Średni' value={2} />
                <Picker.Item label= 'Wysoki' value={3} />
              </Picker>
          </View>
          <View style={{backgroundColor: '#03368a', flexDirection: 'row', display: showFilters==false ? 'none' : 'flex'}}>
            <Text style={styles.filterText}>Stan</Text> 
              <Picker
                selectedValue={FilterDone}
                onValueChange={(itemValue, itemIndex) =>
                  setFilterDone(itemValue)
                }
                mode='dropdown'
                style={{minWidth: '75%', color: 'white'}}
                dropdownIconColor = 'white'
                >
                <Picker.Item label= 'Wszystkie' value='' />
                <Picker.Item label= 'Nieukończone' value={false} />
                <Picker.Item label= 'Ukończone' value={true} />
              </Picker>
          </View>
            <View>
              <TouchableOpacity style={{backgroundColor: '#060554', alignItems: 'center'}} onPress={() => setShowFilters(!showFilters)}>
                <Text style={{color: 'white'}}>FILTRUJ {showFilters == true ? <FontAwesome5
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
          <Text style={styles.Listazad}>Lista zadań jest pusta</Text>
        : setSelectedTasks(TasksDateFilterIndex).length == 0 ?
          <Text style={styles.Listazad}>Brak zadań o podanych kryteriach</Text>
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
          sections={setSelectedTasks(TasksDateFilterIndex)}
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

  export const styles = StyleSheet.create({
    container: {
      backgroundColor: '#ffffff',
      height: '100%',
    },
    Header: {
      color: '#ffffff',
      backgroundColor: '#0b146b',
      fontSize: 20,
      fontFace: 'tahoma',
      padding: 15,
      fontWeight: '500'
    },
    Listazad: {
      color: '#909899',
      fontSize: 20,
      marginTop: 20,
      textAlign: 'center'
    },
    AddButton: {
      position: 'absolute',
      bottom: 30,
      right: 30,
      width: 70,
      alignItems: 'center',
      borderRadius: 100,
      backgroundColor: 'blue',
    },
    plus: {
      color: '#ffffff',
      fontSize: 50,
      padding: -20
    },
    checkbox: {
      paddingRight: '3%',
    },
    filterText: {
      color: 'white',
      fontSize: 20,
      paddingHorizontal: '2%',
      paddingVertical: '3%',
      fontWeight: '500',
      width: '25%'
    },
    taskDateFilter_bar: {
      color: 'white',
      flexDirection: 'row',
      height: 50,
      borderWidth: 2,
      borderColor: '#555555',
    },
    TaskDateFilterText: {
      color: 'white',
      fontSize: 20
  },
    Item_date: {
      backgroundColor: '#95cff0',
      textAlign: 'center'
    },
    Item: {
      marginHorizontal: '1%',
      marginVertical: '1%',
      paddingHorizontal: '1%',
      backgroundColor: '#f0f7ff',
      justifyContent: 'center'
    },
    Item_row:{
      flexDirection: 'row',
      alignItems: 'center',
    },
    Item_body:{
      flex: 1,
    },
    ItemTitle: {
      fontWeight: 'bold',
      fontSize: 18,
    },
    ItemDesc: {

    }
  });