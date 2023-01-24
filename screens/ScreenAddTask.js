import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, StatusBar, TextInput, Alert, ScrollView, Linking } from 'react-native';
import Checkbox from 'expo-checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';
import { setTasks } from '../redux/actions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';
import notifee, { AndroidImportance, TimestampTrigger, TriggerType} from '@notifee/react-native';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import {pad, toLocaleISOString } from './ScreenEditTask';

import { setNextID } from './ScreenMain';

import { styles } from '../GlobalStyle';

// DO ZADAŃ CYKLICZNYCH
const RepeatOptionsPL = [
  {
    label: 'Codziennie',
    value: 1,
  },
  {
    label: 'Co 2 dni',
    value: 2,
  },
  {
    label: 'Co tydzień',
    value: 3,
  },
  {
    label: 'Co 2 tygodnie',
    value: 4,
  },
  {
    label: 'Co miesiąc',
    value: 5,
  },
  {
    label: 'Co 2 miesiące',
    value: 6,
  },
  {
    label: 'Co 3 miesiące',
    value: 7,
  },
  {
    label: 'Co pół roku',
    value: 8,
  },
  {
    label: 'Co rok',
    value: 9,
  },
  ]
  
  const RepeatOptionsEN = [
    {
      label: 'Every day',
      value: 1,
    },
    {
      label: 'Every other day',
      value: 2,
    },
    {
      label: 'Every week',
      value: 3,
    },
    {
      label: 'Every other week',
      value: 4,
    },
    {
      label: 'Every month',
      value: 5,
    },
    {
      label: 'Every other month',
      value: 6,
    },
    {
      label: 'Every 3 months',
      value: 7,
    },
    {
      label: 'Every 6 months',
      value: 8,
    },
    {
      label: 'Every year',
      value: 9,
    },
    ]

export default function ScreenAddTask({navigation}){

  const { tasks, taskID } = useSelector(state => state.taskReducer);
  const { settings } = useSelector(state => state.taskReducer);
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

  // zaplanuj powiadomienie
async function onCreateTriggerNotification(date, taskID) {
  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: date.getTime(),
  };

  if(settings.Language == 1){
    var name = 'Powiadomienia o zadaniach ';
    var view = 'Wyświetl';
    var setAsDone = 'Ustaw jako wykonane';
  }
  else if (settings.Language == 2){
    var name = 'Notifications about tasks ';
    var view = 'View';
    var setAsDone = 'Set as done';
  }

 const channelId = await notifee.createChannel({
  id: 'default',
  name: name,
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
      largeIcon: priority==1 ? require('../Icons/priorityL.png') : priority==2 ? require('../Icons/priorityM.png') : require('../Icons/priorityH.png'),
      actions: [
        {
          title: view,
          pressAction: {
            id: 'default',
          },
        },
        {
          title: setAsDone,
          pressAction: {
            id: 'set-as-done',
          },
        }
      ],
    },
  },
  trigger,
);
}

// jezeli lista zadań jest pusta wyświetl komunikat o powiadomieniach
  if (tasks.length == 0 && showNotification) {
    if(settings.Language == 1)
    Alert.alert(
      "Powiadomienia",
      "Na telefonach niektórych producentów np. Xiaomi, powiadomienia mogą nie zostać wyświetlone. W takim wypadku należy zezwolić aplikacji na Autostart lub zmienić ustawienia oszczędzania energii.",
      [
        {
          text: "ZEZWÓL",
          onPress: () => {Linking.openSettings();},
        },
        { text: "ANULUJ" },
      ]
    );
    else if (settings.Language == 2){
      Alert.alert(
        "Notifications",
        "On phones from some manufacturers, e.g. Xiaomi, notifications may not be displayed. In this case, allow the application to Autostart or change the energy saving settings.",
        [
          {
            text: "ALLOW",
            onPress: () => {Linking.openSettings();},
          },
          { text: "CANCEL" },
        ]
      );
    }
    setShowNotification(false);
  }

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date(date);
    setShowDate(false);
    setShowTime(false);
    setTaskDate(currentDate);
  };

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
    if (settings.Language == 1){
      navigation.setOptions({
        title: 'Nowe zadanie'
      });
    }
    else{
      navigation.setOptions({
        title: 'New Task'
      });
    }
  }, [])

  // zaktualizuj zadanie
  const updateTask = () => {
    var Task = {
      ID: taskID,
      Title: title,
      Description: description,
      IsTaskRecc: isTaskRecc,
      TaskReccID: null,
      Date: typeof date == "string" ? date : toLocaleISOString(date),
      Done: false,
      Priority: priority,
    }
    let newTasks = [...tasks];
    if(isTaskRecc == false){
      try{
        newTasks.push(Task);
        AsyncStorage.setItem('Tasks', JSON.stringify(newTasks))
        .then(() => {
            if (date.getTime() > new Date(Date.now()))
              onCreateTriggerNotification(new Date(date), taskID)
            {settings.Language == 1 ? Alert.alert('Nowe zadanie', title) : Alert.alert('New Task', title)};
            dispatch(setTasks(newTasks));
            navigation.goBack();
        })
        .catch(err => console.log(err))
      }
      catch(error){
        console.log(error);
      }
    }
    else{
      var time;
      switch(Repeat){
        case 1:
          time = 86400000;
          break;
        case 2:
          time = 86400000 * 2;
          break;
        case 3:
          time = 86400000 * 7;
          break;
        case 4:
          time = 86400000 * 14;
          break;
        case 5:
          time = 1;
          break;
        case 6:
          time = 2;
          break;   
        case 7:
          time = 3;
          break;
        case 8:
          time = 6;
          break;
        case 9:
          time = 12;
          break;
        default:
          time = 0;
          break;
      }
      var start = TaskReccStartDate.getTime();
      var end = TaskReccEndDate.getTime();
      while (start < end){
        if (start == TaskReccStartDate.getTime() && nextDate != date.getTime()){
          var nextReccID = setNextID(newTasks, 'RECCID');
          var nextDate = date.getTime();
          var tempDate = new Date(date.setMonth(date.getMonth()));
        }
        else{
          if(Repeat > 0 && Repeat < 5){
            nextDate += time;
          }
          else{
            var nextTempDate = new Date(tempDate.setMonth(tempDate.getMonth() + time));
            var nextDate = nextTempDate.getTime();
            var tempDate = nextTempDate;
          }
        }
        var nextID = setNextID(newTasks, 'ID');
        Task = {
          ID: nextID,
          Title: title,
          Description: description,
          IsTaskRecc: isTaskRecc,
          TaskReccID: nextReccID,
          Date: toLocaleISOString(new Date(nextDate)),
          Done: false,
          Priority: priority,
        }
        if (new Date(nextDate).getTime() > new Date(Date.now()))
          onCreateTriggerNotification(new Date(nextDate), nextID)
        newTasks.push(Task);
        start = nextDate;
      }
      try{
      AsyncStorage.setItem('Tasks', JSON.stringify(newTasks))
      .then(() => {
          if(newTasks.length == tasks.length){
            {settings.Language == 1 ? Alert.alert('Zadanie cykliczne nie zostało dodane', 'Wybierz poprawną datę rozpoczęcia i zakończenia') : Alert.alert('New Reccuring Task has not been added', 'Select correct start and end date')};
          }
          else{
          {settings.Language == 1 ? Alert.alert('Nowe zadanie cykliczne', title) : Alert.alert('New Reccuring Task', title)};
          dispatch(setTasks(newTasks));
          navigation.goBack();
          }
       })
      .catch(err => console.log(err))
        }
      catch(error){
        console.log(error);
      }
    }
  }

  // ustaw zadanie
  const setTask = () => {
    if(title.length == 0){
      {settings.Language == 1 ? Alert.alert('Niepoprawna nazwa','Pole Nazwa nie może być puste!') : Alert.alert('Invalid Title','The Title field cannot be empty!')};
    }
    else if(date.getTime() < Date.now()){ //do Date.now() trzeba też dodać godzinę
      if(settings.Language == 1)
      {
        Alert.alert('Niepoprawna data przypomnienia', 'Wybrana data przypomnienia wygasła, czy mimo to chcesz kontynować?',
        [
          {
            text: "TAK",
            onPress: (updateTask),
            style: "cancel"
          },
          { text: "NIE" }
        ])
      }
      else if(settings.Language == 2){
        Alert.alert('Invalid reminder date', 'Selected reminder date has expired, do you want to continue anyway?',
        [
          {
            text: "YES",
            onPress: (updateTask),
            style: "cancel"
          },
          { text: "NO" }
        ])
      }
    }
    else{
      updateTask();
    }
  }

  return(
    <View style={settings.DarkMode == false ? styles.container : styles.container_Dark}>
      <StatusBar barStyle = "auto" />
      <ScrollView>
        <Text style={[styles.TaskLabel, {color: settings.DarkMode == false ? 'black' : 'white'}]}>{settings.Language == 1 ? 'Nazwa' : 'Title'}</Text>
          <TextInput 
            style={settings.DarkMode == false ? styles.InputText : styles.InputText_Dark}
            value={title}
            placeholder={settings.Language == 1 ? 'Wpisz nazwę zadania...' : 'Enter task title...'}
            placeholderTextColor='grey'
            onChangeText={(value) => setTitle(value)}
          />
        <Text style={[styles.TaskLabel, {color: settings.DarkMode == false ? 'black' : 'white'}]}>{settings.Language == 1 ? 'Opis (opcjonalnie)' : 'Description (optional)'}</Text>
          <TextInput 
            style={settings.DarkMode == false ? styles.InputText : styles.InputText_Dark}
            value={description}
            placeholder={settings.Language == 1 ? 'Dodaj opis...' : 'Add description...'}
            placeholderTextColor='grey'
            multiline
            onChangeText={(value) => setDescription(value)}
          />
        <Text style={styles.checkboxText}>
          <Checkbox
            style={styles.checkbox} 
            value={isTaskRecc} 
            onValueChange={setTaskRecc}
          />
        <Text style={[styles.TaskLabel, {color: settings.DarkMode == false ? 'black' : 'white'}]}>{settings.Language == 1 ?'  Cykliczne' : '  Reccuring'}</Text>
      </Text>
      {isTaskRecc ?
        <View>
          <View style={styles.DateHour}>
            <Text style={[styles.TaskLabel, {color: settings.DarkMode == false ? 'black' : 'white'}]}>{settings.Language == 1 ? 'Dzień rozpoczęcia' : 'Start Day'}</Text>
            <Text style={[styles.TaskLabel, {color: settings.DarkMode == false ? 'black' : 'white'}]}>{settings.Language == 1 ? 'Dzień zakończenia' : 'End Day'}</Text>
          </View>
          <View style={settings.DarkMode == false ? [styles.DateHourButton,{paddingRight: 20}] : [styles.DateHourButton_Dark,{paddingRight: 20}]}>
            {showStartDate ?
              <View>
                <TouchableOpacity
                  onPress={() => setShowStartDate(true)}>
                  <Text style = {[styles.DateHourText, {color: settings.DarkMode == false ? 'black' : 'white'}]}>
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
                <Text style = {[styles.DateHourText, {color: settings.DarkMode == false ? 'black' : 'white'}]}>
                  <FontAwesome5
                    name='calendar-day'
                    size={30} /> {pad(new Date(TaskReccStartDate).getDate()) + "/" + pad(new Date(TaskReccStartDate).getMonth() + 1) + "/" + new Date(TaskReccStartDate).getFullYear()}
                </Text>
              </TouchableOpacity>}
            {showEndDate ?
              <View>
                <TouchableOpacity
                  onPress={() => setShowEndDate(true)}>
                  <Text style = {[styles.DateHourText, {color: settings.DarkMode == false ? 'black' : 'white'}]}>
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
                <Text style = {[styles.DateHourText, {color: settings.DarkMode == false ? 'black' : 'white'}]}>
                  <FontAwesome5
                    name='calendar-day'
                    size={30} /> {pad(new Date(TaskReccEndDate).getDate()) + "/" + pad(new Date(TaskReccEndDate).getMonth() + 1) + "/" + new Date(TaskReccEndDate).getFullYear()}
                </Text>
              </TouchableOpacity>
            }
          </View>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <Text style={[styles.TaskLabel, {color: settings.DarkMode == false ? 'black' : 'white'}]}>{settings.Language == 1 ? 'Powtarzaj  ' : 'Repeat  '}</Text>
                <DropDownPicker
                  zIndex={5000}
                  placeholder="Wybierz opcje powtarzania"
                  containerStyle={{width: '70%', marginTop: 10}}
                  open={showRepeat}
                  value={Repeat}
                  items={settings.Language == 1 ? RepeatOptionsPL : RepeatOptionsEN}
                  setOpen={setShowRepeat}
                  setValue={setRepeat}
                  theme={settings.DarkMode == false ? "LIGHT" : "DARK"}
                  listMode='SCROLLVIEW'
                />
            </View>
          <View style={{flexDirection: 'row', borderBottomWidth: 1}}>
          <Text style={[styles.TaskLabel, {color: settings.DarkMode == false ? 'black' : 'white'}]}>{settings.Language == 1 ? 'O godzinie  ' : 'At hour  '}</Text>
            {showTime ?
              <View>
                <TouchableOpacity 
                  onPress={() => setShowTime(true)}>
                    <Text style = {[styles.DateHourText, {marginTop: 7, marginBottom: 10, color: settings.DarkMode == false ? 'black' : 'white'}]}>
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
                    <Text style = {[styles.DateHourText, {marginTop: 7, marginBottom: 10, color: settings.DarkMode == false ? 'black' : 'white'}]}>
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
          <Text style={[styles.TaskLabel, {color: settings.DarkMode == false ? 'black' : 'white'}]}>{settings.Language == 1 ? 'Dzień' : 'Day'}</Text>
          <Text style={[styles.TaskLabel, {color: settings.DarkMode == false ? 'black' : 'white'}]}>{settings.Language == 1 ? 'Godzina' : 'Hour'}</Text>
        </View>
      <View style={settings.DarkMode == false ? styles.DateHourButton : styles.DateHourButton_Dark}>
        {showDate ?
        <View>
          <TouchableOpacity 
            onPress={() => setShowDate(true)}>
              <Text style = {[styles.DateHourText, {color: settings.DarkMode == false ? 'black' : 'white'}]}>
              <FontAwesome5
                name = 'calendar-day'
                color= {settings.DarkMode == false ? 'black' : 'white'}
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
              <Text style = {[styles.DateHourText, {color: settings.DarkMode == false ? 'black' : 'white'}]}>
              <FontAwesome5
                name = 'calendar-day'
                color= {settings.DarkMode == false ? 'black' : 'white'}
                size = {30} /> {pad(new Date(date).getDate())+"/"+pad(new Date(date).getMonth()+1)+"/"+new Date(date).getFullYear()}
              </Text>
            </TouchableOpacity>
        }
        {showTime ?
        <View>
          <TouchableOpacity 
            onPress={() => setShowTime(true)}>
              <Text style = {[styles.DateHourText, {color: settings.DarkMode == false ? 'black' : 'white'}]}>
              <FontAwesome5
                name = 'clock'
                color= {settings.DarkMode == false ? 'black' : 'white'}
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
              <Text style = {[styles.DateHourText, {color: settings.DarkMode == false ? 'black' : 'white'}]}>
              <FontAwesome5
                name = 'clock'
                color= {settings.DarkMode == false ? 'black' : 'white'}
                size = {30} /> {pad(new Date(date).getHours()) + ":" + pad(new Date(date).getMinutes())}
              </Text>
            </TouchableOpacity>
        }
        </View>
      </View>
      }
      <Text style={[styles.TaskLabel, {color: settings.DarkMode == false ? 'black' : 'white'}]}>{settings.Language == 1 ? 'Priorytet' : 'Priority'}</Text>
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
        <TouchableOpacity 
          style={styles.EditTask}
          onPress={setTask}
          >
          <Text style={styles.ButtonAdd}>{settings.Language == 1 ? 'Dodaj' : 'Add'}</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
  </View>
  )
}