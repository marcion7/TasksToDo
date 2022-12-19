import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, Alert, Dimensions, ScrollView } from 'react-native';
import { FlatList } from 'react-native-gesture-handler';
import { useDispatch, useSelector } from 'react-redux';
import { setTaskID, setTasks, groupBy } from '../redux/actions';
import { Picker } from '@react-native-picker/picker';
import * as Progress from 'react-native-progress';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

//import theme from './ScreenSettings';

export default function ScreenMain( {navigation} ){

  const {tasks} = useSelector(state => state.taskReducer);
  const dispatch = useDispatch();

  const [showFilters, setShowFilters] = useState(false);
  const [FilterPriority, setFilterPriority] = useState('');
  const [FilterDone, setFilterDone] = useState('');

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

const deleteTask = (id) => {
    const filteredTasks = tasks.filter(task => task.ID !== id);
    AsyncStorage.setItem('Tasks', JSON.stringify(filteredTasks))
      .then(() =>{
        dispatch(setTasks(filteredTasks));
      })
      .catch(err => console.log(err))
  }

/*const filterTasks = () => {
    if(FilterPriority !== '' && FilterDone !== '')
      filtered = groupBy(tasks.filter(task => task.Done === FilterDone && task.Priority === FilterPriority), 'Date')
    else if(FilterPriority !== '')
      filtered = groupBy(tasks.filter(task => task.Priority === FilterPriority), 'Date');
    else if(FilterDone !== '')
      filtered = groupBy(tasks.filter(task => task.Done === FilterDone), 'Date');
    else
      filtered = groupBy(tasks, 'Date');
    return Object.keys(filtered).map((key)=> ({id: [key], value: filtered[key]}))
    //return Object.keys(filtered).map((key)=> (filtered[key]))
 }*/

 const filterTasks = () => {
  if(FilterPriority !== '' && FilterDone !== '')
    filtered = groupBy(tasks.filter(task => task.Done === FilterDone && task.Priority === FilterPriority), 'Date')
  else if(FilterPriority !== '')
    filtered = groupBy(tasks.filter(task => task.Priority === FilterPriority), 'Date');
  else if(FilterDone !== '')
    filtered = groupBy(tasks.filter(task => task.Done === FilterDone), 'Date');
  else
    filtered = groupBy(tasks, 'Date');
  console.log(Object.keys(filtered).map((key)=> ({id: key, value: filtered[key]})))
  return Object.keys(filtered).map((key)=> ({id: key, value: filtered[key]}))
  //return Object.keys(filtered).map((key)=> (filtered[key]))
}

function countDoneTasks(tasks){
 var counter = 0;
 for (let i = 0; i < tasks.length; i++) {
    if (tasks[i].Done == true) {
        counter++;
    }
  }
  return counter;
};

const setNextID = (array) => {
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
      break;r
    }
  }
 // console.log(array)
  return id;
}

const isWhatPercentOf = (numA, numB) => {
  return Math.round((numA / numB) * 100);
}

 const filteredTasks = filterTasks();
 //var days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
 //var months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
 var days = ['Niedziela','Poniedziałek','Wtorek','Środa','Czwartek','Piątek','Sobota'];
 var months = ['Styczeń','Luty','Marzec','Kwiecień','Maj','Czerwiec','Lipiec','Sierpień','Wrzesień','Październik','Listopad','Grudzień'];

 /*<View>
 <Text style={[{fontSize: 20}, styles.Item_date]}>
   {days[new Date(item.id).getDay()]}, {new Date(item.id).getDate()} {months[new Date(item.id).getMonth()]} {new Date(item.id).getFullYear()}
 </Text>
 <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#95cff0'}}>
   <Progress.Bar progress={isWhatPercentOf(countDoneTasks(item.value) , item.value.length)/100} />
 <Text>
   {' '}{countDoneTasks(item.value)}/{item.value.length} ({isWhatPercentOf(countDoneTasks(item.value) , item.value.length)}%)
 </Text>
 </View>*/

    return(
    <View style={styles.container}>
      <StatusBar barStyle = "auto" />
      <Text style={styles.Header}>Lista zadań</Text>
        {tasks.length == 0 ?
          <Text style={styles.Listazad}>Lista zadań jest pusta</Text>
        :
        <View>
          <View style={{backgroundColor: '#7edede', display: showFilters==false ? 'none' : 'flex'}}>
            <Text style={styles.filterText}>Priorytet</Text>
              <Picker
                selectedValue={FilterPriority}
                onValueChange={(itemValue, itemIndex) =>
                  setFilterPriority(itemValue)
                }
                mode='dropdown'
                style={{minWidth: '33%'}}
                >
                <Picker.Item label= 'Wszystkie' value='' />
                <Picker.Item label= 'Niski' value={1} />
                <Picker.Item label= 'Średni' value={2} />
                <Picker.Item label= 'Wysoki' value={3} />
              </Picker>
            <Text style={styles.filterText}>Stan</Text> 
              <Picker
                selectedValue={FilterDone}
                onValueChange={(itemValue, itemIndex) =>
                  setFilterDone(itemValue)
                }
                mode='dropdown'
                style={{minWidth: '100%'}}
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
        {filteredTasks.map((item) =>
        <FlatList
          ListHeaderComponent={
          <Text style={[{fontSize: 20}, styles.Item_date]}>
            {days[new Date(item.id).getDay()]}, {new Date(item.id).getDate()} {months[new Date(item.id).getMonth()]} {new Date(item.id).getFullYear()}
          </Text>
          }
          data={item.value}
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
                    name = 'recycle'
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
                    size = {20} /> {item.Time.slice(11,16)}
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
        )}
        </View>
        }
        <TouchableOpacity style={styles.AddButton}
          onPress={() => {
            dispatch(setTaskID(setNextID(tasks)));
            navigation.navigate('Tasks')}
          }
          >
          <Text style={styles.plus}>+</Text>
        </TouchableOpacity>
    </View>
    )
  }

  const styles = StyleSheet.create({
    container: {
      backgroundColor: '#ffffff',
      height: '100%'
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
      fontSize: 20,
      backgroundColor: '#037bfc',
      paddingHorizontal: '1%'
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