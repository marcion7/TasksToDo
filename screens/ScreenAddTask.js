import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, StatusBar, TextInput, Alert, ScrollView, Linking} from 'react-native';
import Checkbox from 'expo-checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';
import { setTasks } from '../redux/actions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';
import notifee, { AndroidImportance, TimestampTrigger, TriggerType} from '@notifee/react-native';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import {styles, pad, toLocaleISOString, getTaskDate,
        RepeatOptions, MonthsOptions, DaysOptions} from './ScreenEditTask';

import { setNextID } from './ScreenMain';

export default function ScreenAddTask({navigation}){

  const { tasks, taskID } = useSelector(state => state.taskReducer);
  const dispatch = useDispatch();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isTaskRecc, setTaskRecc] = useState(false);
  const [priority, setPriority] = useState(1);
  
  const [date, setTaskDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [showNotification, setShowNotification] = useState(true);

  const [TaskReccStartDate, setTaskStartDate] = useState(new Date());
  const [showStartDate, setShowStartDate] = useState(false);
  const [TaskReccEndDate, setTaskEndDate] = useState(new Date());
  const [showEndDate, setShowEndDate] = useState(false);
  
  const [Repeat, setRepeat] = useState(1);
  const [showRepeat, setShowRepeat] = useState(false);
  const [RepeatOptionsValue, setRepeatOptions] = useState(RepeatOptions);
  
  const [MonthsRepeat, setMonthsRepeat] = useState([])
  const [showMonthsRepeat, setShowMonthsRepeat] = useState(false);
  const [MonthsRepeatValue, setMonthsRepeatOptions] = useState(MonthsOptions);
  
  const [DaysRepeat, setDaysRepeat] = useState([])
  const [showDaysRepeat, setShowDaysRepeat] = useState(false);
  const [DaysRepeatValue, setDaysRepeatOptions] = useState(DaysOptions);

  // zaplanuj powiadomienie
async function onCreateTriggerNotification() {

    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
    };

   const channelId = await notifee.createChannel({
    id: 'default',
    name: 'Przypomnienie o zadaniach ',
    importance: AndroidImportance.HIGH
  });

  // Create a trigger notification
  await notifee.createTriggerNotification(
    {
      id: taskID.toString(),
      title: title,
      body: description,
      android: {
        channelId: channelId,
        color: '#2d53a6',
        largeIcon: priority==1 ? require('../largeIcons/priorityL.png') : priority==2 ? require('../largeIcons/priorityM.png') : require('../largeIcons/priorityH.png'),
        actions: [
          {
            title: 'Usuń',
            pressAction: {
              id: 'mark-as-read',
            },
          },
        ],
      },
    },
    trigger,
  );
}

// jezeli lista zadań jest pusta wyświetl komunikat o powiadomieniach
  if (tasks.length == 0 && showNotification) {
    Alert.alert(
      "Powiadomienia",
      "Aby otrzymać powiadomienia o zadaniach należy zezwolić aplikacji na Autostart. Dotyczy to niektórych producentów telefonów np. Xiaomi.",
      [
        {
          text: "ZEZWÓL",
          onPress: () => {Linking.openSettings();},
        },
        { text: "ANULUJ" },
      ]
    );
    setShowNotification(false);
  }

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date(date);
    setShowDate(false);
    setShowTime(false);
    setTaskDate(currentDate);
  };

   // DO ZADAŃ CYKLICZNYCH
  const SetShow = () => {
    if (isTaskRecc)
      setTaskRecc(false);
    else
      setTaskRecc(true);
      setShowRepeat(false);
      setShowMonthsRepeat(false);
      setShowDaysRepeat(false);
  }

  const onStartDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date(date);
    setShowStartDate(false);
    setTaskStartDate(currentDate);
  };
  
  const onEndDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date(date);
    setShowEndDate(false);
    setTaskEndDate(currentDate);
  };

  useEffect(() => {
    getTask();
  }, [])

// pobierz zadanie
  const getTask = () => {
    const Task = tasks.find(task => task.ID === taskID)
    if(Task){
      setTitle(Task.Title);
      setDescription(Task.Description);
      setTaskRecc(Task.IsTaskRecc);
      setTaskDate(Task.Date);
      setPriority(Task.Priority);
    }
  }

  const setTask = () => {
    if(title.length == 0){
      Alert.alert('Niepoprawna nazwa','Pole nazwa nie może być puste!');
    }
    else if(getTaskDate(date) - 60000 < new Date(Date.now() + 3600000)){ //dodaj godzinę i odejmij 1 minutę, do Date.now() trzeba też dodać godzinę
      Alert.alert('Niepoprawna data przypomnienia', 'Należy wybrać datę przypomnienia co najmniej 1 minutę póżniej niż aktualna godzina!');
    }
    else{
      try{
        var Task ={
          ID: taskID,
          Title: title,
          Description: description,
          IsTaskRecc: isTaskRecc,
          Date: typeof date == "string" ? date : toLocaleISOString(date),
          Done: false,
          Priority: priority,
        }
        let newTasks = [...tasks, Task];

        AsyncStorage.setItem('Tasks', JSON.stringify(newTasks))
        .then(() => {
          dispatch(setTasks(newTasks));
          Alert.alert('Nowe zadanie', title);
          onCreateTriggerNotification()
          navigation.goBack();
        })
        .catch(err => console.log(err))
      }
      catch(error){
        console.log(error);
      }
    }
  }

  const setTaskRecurring = () => {
      if(title.length == 0){
        Alert.alert('Niepoprawna nazwa','Pole nazwa nie może być puste!');
      }
      else if(getTaskDate(date) - 60000 < new Date(Date.now() + 3600000)){ //dodaj godzinę i odejmij 1 minutę, do Date.now() trzeba też dodać godzinę
        Alert.alert('Niepoprawna data przypomnienia', 'Należy wybrać datę przypomnienia co najmniej 1 minutę póżniej niż aktualna godzina!');
      }
      else{
        for (let index = 0; index < 4; index++) {
          try{
            var Task = {
              ID: taskID,
              Title: title,
              Description: description,
              IsTaskRecc: isTaskRecc,
              Date: typeof date == "string" ? date : toLocaleISOString(date),
              Done: false,
              Priority: priority,
            }
            
            let newTasks = [...tasks, Task];
    
            AsyncStorage.setItem('Tasks', JSON.stringify(newTasks))
            .then(() => {
              dispatch(setTasks(newTasks));
              //Alert.alert('Nowe zadanie', title);
              //onCreateTriggerNotification()
              //navigation.goBack();
              setTaskDate(date.setHours(date.getHours() + 24));
              //setTaskDate(new Date(new Date(date).getTime() + 60 * 60 * 24 * 1000));
            })
            .catch(err => console.log(err))
          }
          catch(error){
            console.log(error);
          }
        }
      }
  //Alert.alert('Nowe zadanie', title);
  //navigation.goBack();
}

  return(
    <View style={styles.container}>
      <StatusBar barStyle = "auto" />
      <ScrollView>
        <Text style={styles.TaskLabel}>Nazwa</Text>
          <TextInput 
            style={styles.InputText}
            value={title}
            placeholder='Wpisz nazwę zadania...'
            onChangeText={(value) => setTitle(value)}
          />
        <Text style={styles.TaskLabel}>Opis (opcjonalnie)</Text>
          <TextInput 
            style={styles.InputText}
            value={description}
            placeholder='Dodaj opis...'
            multiline
            onChangeText={(value) => setDescription(value)}
          />
        <Text style={styles.checkboxText}>
          <Checkbox
            style={styles.checkbox} 
            value={isTaskRecc} 
            onValueChange={SetShow}
          />
        <Text style={styles.TaskLabel}>  Cykliczne</Text>
      </Text>
      {isTaskRecc ?
        <View>
          <View style={styles.DateHour}>
            <Text style={styles.TaskLabel}>Data rozpoczęcia</Text>
            <Text style={styles.TaskLabel}>Data zakończenia</Text>
          </View>
        <View style={styles.StartEndDatesButton}>
            {showStartDate ?
              <View>
                <TouchableOpacity
                  onPress={() => setShowStartDate(true)}>
                  <Text style={styles.DateHourText}>
                    <FontAwesome5
                      name='calendar-day'
                      size={30} /> {pad(new Date(TaskReccStartDate).getDate()) + "/" + pad(new Date(TaskReccStartDate).getMonth() + 1) + "/" + new Date(TaskReccStartDate).getFullYear()}
                  </Text>
                </TouchableOpacity>
                <DateTimePicker
                  value={new Date(TaskReccStartDate)}
                  mode={"date"}
                  minimumDate={Date.now()}
                  onChange={onStartDateChange} />
              </View>
              :
              <TouchableOpacity
                onPress={() => setShowStartDate(true)}>
                <Text style={styles.DateHourText}>
                  <FontAwesome5
                    name='calendar-day'
                    size={30} /> {pad(new Date(TaskReccStartDate).getDate()) + "/" + pad(new Date(TaskReccStartDate).getMonth() + 1) + "/" + new Date(TaskReccStartDate).getFullYear()}
                </Text>
              </TouchableOpacity>}
            {showEndDate ?
              <View>
                <TouchableOpacity
                  onPress={() => setShowEndDate(true)}>
                  <Text style={styles.DateHourText}>
                    <FontAwesome5
                      name='calendar-day'
                      size={30} /> {pad(new Date(TaskReccEndDate).getDate()) + "/" + pad(new Date(TaskReccEndDate).getMonth() + 1) + "/" + new Date(TaskReccEndDate).getFullYear()}
                  </Text>
                </TouchableOpacity>
                <DateTimePicker
                  value={new Date(TaskReccEndDate)}
                  mode={"date"}
                  minimumDate={new Date(TaskReccStartDate)}
                  onChange={onEndDateChange} />
              </View>
              :
              <TouchableOpacity
                onPress={() => setShowEndDate(true)}>
                <Text style={styles.DateHourText}>
                  <FontAwesome5
                    name='calendar-day'
                    size={30} /> {pad(new Date(TaskReccEndDate).getDate()) + "/" + pad(new Date(TaskReccEndDate).getMonth() + 1) + "/" + new Date(TaskReccEndDate).getFullYear()}
                </Text>
              </TouchableOpacity>
            }
          </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.TaskRepeatLabel}>Powtarzaj </Text>
                <DropDownPicker
                  zIndex={5000}
                  containerStyle={{width: '70%', marginTop: 10}}
                  open={showRepeat}
                  value={Repeat}
                  items={RepeatOptions}
                  setOpen={setShowRepeat}
                  setValue={setRepeat}
                  listMode='SCROLLVIEW'
                />
            </View>
          {Repeat == 2 ?
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Text style={styles.TaskRepeatLabel}>Dni </Text>
                <DropDownPicker
                  zIndex={4000}
                  placeholder="Wybierz dni"
                  containerStyle={{width: '50%', marginTop: 10}}
                  multiple={true}
                  open={showDaysRepeat}
                  value={DaysRepeat}
                  items={DaysOptions}
                  setOpen={setShowDaysRepeat}
                  setValue={setDaysRepeat}
                  listMode='SCROLLVIEW'
                />
            </View>
          : Repeat == 3 ?
          <View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.TaskRepeatLabel}>Miesiące </Text>
                  <DropDownPicker
                    zIndex={4000}
                    placeholder="Wybierz miesiące"
                    containerStyle={{width: '70%', marginTop: 10}}
                    multiple={true}
                    open={showMonthsRepeat}
                    value={MonthsRepeat}
                    items={MonthsOptions}
                    setOpen={setShowMonthsRepeat}
                    setValue={setMonthsRepeat}
                    listMode='SCROLLVIEW'
                  />
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.TaskRepeatLabel}>Dni </Text>
                  <DropDownPicker
                    zIndex={2000}
                    placeholder="Wybierz dni"
                    containerStyle={{width: '70%', marginTop: 10}}
                    multiple={true}
                    open={showDaysRepeat}
                    value={DaysRepeat}
                    items={DaysOptions}
                    setOpen={setShowDaysRepeat}
                    setValue={setDaysRepeat}
                    listMode='SCROLLVIEW'
                  />
              </View>
            </View>
           : ''
          }
          <View style={{flexDirection: 'row', borderBottomWidth: 1}}>
            <Text style={styles.TaskRepeatLabel}>O godzinie</Text> 
            {showTime ?
              <View>
                <TouchableOpacity 
                  onPress={() => setShowTime(true)}>
                    <Text style = {[styles.DateHourText, {marginTop: 7, marginBottom: 10}]}>
                    <FontAwesome5
                      name = 'clock'
                      size = {30} /> {pad(new Date(date).getHours()) + ":" + pad(new Date(date).getMinutes())}
                    </Text>
                </TouchableOpacity>
                  <DateTimePicker
                    value={new Date(date)}
                    mode="time"
                    onChange={onDateChange}     
                  />
                </View>
                  :
                  <TouchableOpacity 
                  onPress={() => setShowTime(true)}>
                    <Text style = {[styles.DateHourText, {marginTop: 7, marginBottom: 10}]}>
                    <FontAwesome5
                      name = 'clock'
                      size = {30} /> {pad(new Date(date).getHours()) + ":" + pad(new Date(date).getMinutes())}
                    </Text>
                  </TouchableOpacity>
            }          
          </View>
        </View>
      :
      <View>
        <View style={styles.DateHour}>
          <Text style={styles.TaskLabel}>Data</Text>
          <Text style={styles.TaskLabel}>Godzina</Text>
        </View>
      <View style={styles.DateHourButton}>
        {showDate ?
        <View>
          <TouchableOpacity 
            onPress={() => setShowDate(true)}>
              <Text style = {styles.DateHourText}>
              <FontAwesome5
                name = 'calendar-day'
                size = {30} /> {pad(new Date(date).getDate())+"/"+pad(new Date(date).getMonth()+1)+"/"+new Date(date).getFullYear()}
              </Text>
          </TouchableOpacity>
            <DateTimePicker
              value={new Date(date)}
              mode={"date"}
              minimumDate={Date.now()}
              onChange={onDateChange}     
            />
          </View>
            :
            <TouchableOpacity 
            onPress={() => setShowDate(true)}>
              <Text style = {styles.DateHourText}>
              <FontAwesome5
                name = 'calendar-day'
                size = {30} /> {pad(new Date(date).getDate())+"/"+pad(new Date(date).getMonth()+1)+"/"+new Date(date).getFullYear()}
              </Text>
            </TouchableOpacity>
        }
        {showTime ?
        <View>
          <TouchableOpacity 
            onPress={() => setShowTime(true)}>
              <Text style = {styles.DateHourText}>
              <FontAwesome5
                name = 'clock'
                size = {30} /> {pad(new Date(date).getHours()) + ":" + pad(new Date(date).getMinutes())}
              </Text>
          </TouchableOpacity>
            <DateTimePicker
              value={new Date(date)}
              mode="time"
              onChange={onDateChange}     
            />
          </View>
            :
            <TouchableOpacity 
            onPress={() => setShowTime(true)}>
              <Text style = {styles.DateHourText}>
              <FontAwesome5
                name = 'clock'
                size = {30} /> {pad(new Date(date).getHours()) + ":" + pad(new Date(date).getMinutes())}
              </Text>
            </TouchableOpacity>
        }
        </View>
      </View>
      }
      <Text style={styles.TaskLabel}>Priorytet</Text>
      <View style={styles.priority_bar}>
        <TouchableOpacity
          style={{flex: 1, backgroundColor: '#60f777', justifyContent: 'center', alignItems: 'center'}}
          onPress={() => {setPriority(1)}}
        >
          {priority === 1 &&
            <FontAwesome5
                name={'check'}
                size={25}
                color={'white'}>
            </FontAwesome5>
          }
        </TouchableOpacity>
        <TouchableOpacity
          style={{flex: 1, backgroundColor: '#eff22c', justifyContent: 'center', alignItems: 'center'}}
          onPress={() => {setPriority(2)}}
        >
          {priority === 2 &&
            <FontAwesome5
                name={'check'}
                size={25}
                color={'white'}>
            </FontAwesome5>
          }
        </TouchableOpacity>
        <TouchableOpacity
          style={{flex: 1, backgroundColor: 'red', justifyContent: 'center', alignItems: 'center'}}
          onPress={() => {setPriority(3)}}
        >
        {priority === 3 &&
            <FontAwesome5
                name={'check'}
                size={25}
                color={'white'}>
            </FontAwesome5>
          }
        </TouchableOpacity>
      </View>
      <View style={styles.Buttons}>
      {isTaskRecc === false ? 
        <TouchableOpacity 
          style={styles.EditTask}
          onPress={setTask}
          >
          <Text style={styles.ButtonAdd}>Dodaj</Text>
        </TouchableOpacity>
        :
        <TouchableOpacity 
          style={styles.EditTask}
          onPress={setTaskRecurring}
          >
          <Text style={styles.ButtonAdd}>Dodaj</Text>
        </TouchableOpacity>
        }
      </View>
      </ScrollView>
  </View>
  )
}