import React, { useState, useEffect } from 'react';
import { Text, View, TouchableOpacity, StatusBar, TextInput, Alert, ScrollView} from 'react-native';
import Checkbox from 'expo-checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';
import { setTasks } from '../redux/actions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';
import notifee, { TimestampTrigger, TriggerType, AndroidImportance} from '@notifee/react-native';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { onDeleteNotification } from './ScreenMain';
import { styles }from '../GlobalStyle';

// wyświetl 0 przed cyframi 0...9
export function pad(n) {return n < 10 ? "0"+n : n;}

// Czas lokalny w formacie ISO
export function toLocaleISOString(date) {
  return date.getFullYear() +
      '-' + pad(date.getMonth() + 1) +
      '-' + pad(date.getDate()) +
      'T' + pad(date.getHours()) +
      ':' + pad(date.getMinutes()) +
      ':' + pad(date.getSeconds());
}

// Data w milisekundach
export const getTaskDate = (date) => {
  const d = new Date(date)
  d.setTime(d.getTime() + 60 * 60 * 1000) // dodać 1 godzinę
  const dateInMilisec = new Date(d).getTime()
  return dateInMilisec
}

// DO ZADAŃ CYKLICZNYCH
export const RepeatOptions = [
{
  label: 'Codziennie',
  value: 1,
},
{
  label: 'W wybrane dni',
  value: 2,
},
{
  label: 'W wybrane miesiące',
  value: 3,
},
]

export const MonthsOptions = [
{
  label: 'Styczeń',
  value: 1,
},
{
  label: 'Luty',
  value: 2,
},
{
  label: 'Marzec',
  value: 3,
},
{
  label: 'Kwiecień',
  value: 4,
},
{
  label: 'Maj',
  value: 5,
},
{
  label: 'Czerwiec',
  value: 6,
},
{
  label: 'Lipiec',
  value: 7,
},
{
  label: 'Sierpień',
  value: 8,
},
{
  label: 'Wrzesień',
  value: 9,
},
{
  label: 'Październik',
  value: 10,
},
{
  label: 'Listopad',
  value: 11,
},
{
  label: 'Grudzień',
  value: 12,
}
]

export const MonthsOptionsEN = [
  {
    label: 'January',
    value: 1,
  },
  {
    label: 'February',
    value: 2,
  },
  {
    label: 'March',
    value: 3,
  },
  {
    label: 'April',
    value: 4,
  },
  {
    label: 'May',
    value: 5,
  },
  {
    label: 'June',
    value: 6,
  },
  {
    label: 'July',
    value: 7,
  },
  {
    label: 'August',
    value: 8,
  },
  {
    label: 'September',
    value: 9,
  },
  {
    label: 'October',
    value: 10,
  },
  {
    label: 'November',
    value: 11,
  },
  {
    label: 'December',
    value: 12,
  }
  ]

export const DaysOptions = [
{
  label: 'Poniedziałek',
  value: 1,
},
{
  label: 'Wtorek',
  value: 2,
},
{
  label: 'Środa',
  value: 3,
},
{
  label: 'Czwartek',
  value: 4,
},
{
  label: 'Piątek',
  value: 5,
},
{
  label: 'Sobota',
  value: 6,
},
{
  label: 'Niedziela',
  value: 7,
},
]

export const DaysOptionsEN = [
  {
    label: 'Monday',
    value: 1,
  },
  {
    label: 'Tuesday',
    value: 2,
  },
  {
    label: 'Wednesday',
    value: 3,
  },
  {
    label: 'Thursday',
    value: 4,
  },
  {
    label: 'Friday',
    value: 5,
  },
  {
    label: 'Saturday',
    value: 6,
  },
  {
    label: 'Sunday',
    value: 7,
  },
]

export default function ScreenEditTask({navigation}){

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isTaskRecc, setTaskRecc] = useState(false);
  const [done, setDone] = useState(false);
  const [priority, setPriority] = useState(1);
  
  //const -> var
  const [date, setTaskDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [showNotification, setShowNotification] = useState(true);

  const [TaskReccStartDate, setTaskStartDate] = useState(new Date());
  const [showStartDate, setShowStartDate] = useState(false);
  const [TaskReccEndDate, setTaskEndDate] = useState(new Date());
  const [showEndDate, setShowEndDate] = useState(false);

  
  const [Repeat, setRepeat] = useState(null);
  const [showRepeat, setShowRepeat] = useState(false);
  const [RepeatOptionsValue, setRepeatOptions] = useState(RepeatOptions);
  
  const [MonthsRepeat, setMonthsRepeat] = useState([])
  const [showMonthsRepeat, setShowMonthsRepeat] = useState(false);
  const [MonthsRepeatValue, setMonthsRepeatOptions] = useState(MonthsOptions);
  
  const [DaysRepeat, setDaysRepeat] = useState([])
  const [showDaysRepeat, setShowDaysRepeat] = useState(false);
  const [DaysRepeatValue, setDaysRepeatOptions] = useState(DaysOptions);

  const { tasks, taskID } = useSelector(state => state.taskReducer);
  const { settings } = useSelector(state => state.taskReducer);
  const dispatch = useDispatch();

// zaplanuj powiadomienie
async function onCreateTriggerNotification() {
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
        largeIcon: priority==1 ? require('../Icons/priorityL.png') : priority==2 ? require('../Icons/priorityM.png') : require('../Icons/priorityM.png'),
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
      setShowWeekRepeat(false);
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
    if (settings.Language == 1){
      navigation.setOptions({
        title: 'Edytuj zadanie'
      });
    }
    else{
      navigation.setOptions({
        title: 'Edit Task'
      });
    }
  }, [])

  // alert o usuwaniu zadania
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
      onDeleteNotification(taskID.toString())
      navigation.goBack();
    })
    .catch(err => console.log(err))
}

  // pobierz zadanie
  const getTask = () => {
    const Task = tasks.find(task => task.ID === taskID)
    if(Task){
      // Godzina po kliknięciu jest przesunięta o 1 godzinę 
      var correctData = new Date(Task.Date)
      correctData.setTime(correctData.getTime() - 60 * 60 * 1000) // odjąć 1 godzinę
      //
      setTitle(Task.Title);
      setDescription(Task.Description);
      setTaskRecc(Task.IsTaskRecc);
      setTaskDate(correctData)
      setDone(Task.Done);
      setPriority(Task.Priority);
    }
  }

  // zaktualizuj zadanie
  const updateTask = () => {
    try{
      var Task ={
        ID: taskID,
        Title: title,
        Description: description,
        IsTaskRecc: isTaskRecc,
        Date: typeof date == "string" ? date : toLocaleISOString(date),
        Done: done,
        Priority: priority,
      }
      const index = tasks.findIndex(task => task.ID === taskID)
      let newTasks = [];
      if (index > -1){
        newTasks = [...tasks];
        newTasks[index] = Task;
      }
      else{
        newTasks = [...tasks, Task];
      }

      AsyncStorage.setItem('Tasks', JSON.stringify(newTasks))
      .then(() => {
            dispatch(setTasks(newTasks));
            {settings.Language == 1 ? Alert.alert('Edytowano zadanie', title) : Alert.alert('Task has been edited', title)};
            if (done === false && getTaskDate(date) > new Date(Date.now() + 3600000))
              onCreateTriggerNotification()
            else
              onDeleteNotification(taskID.toString())
            navigation.goBack();
      })
      .catch(err => console.log(err))
    }
    catch(error){
      console.log(error);
    }
  }

  // ustaw zadanie
  const setTask = () => {
    if(title.length == 0){
      {settings.Language == 1 ? Alert.alert('Niepoprawna nazwa','Pole Nazwa nie może być puste!') : Alert.alert('Invalid Title','The Title field cannot be empty!')};
    }
    else if(getTaskDate(date) < new Date(Date.now() + 3600000)){ //do Date.now() trzeba też dodać godzinę
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

 /* const SetTaskCheck = () => {
    if (isTaskRecc == false)
      setTask();
    else
      if(Repeat == 1)
      {
        date = new Date(TaskReccStartDate)
        let tempdate = getTaskDate(date)
        let tempID = taskID
        while (tempdate <= getTaskDate(TaskReccEndDate))
        //for (let i = 0; i < 10; i++ )
        {
          taskID = tempID
          date = new Date(tempdate)
          console.log(date)
          console.log(taskID)
          setTask();
          tempdate += 24 * 60 * 60 * 1000
          tempID += 1
        }
      }
  }*/

  return(
    <View style={settings.DarkMode == false ? styles.container : styles.container_Dark}>
      <StatusBar barStyle = "auto" />
      <ScrollView>
        <Text style={{marginLeft: settings.Language == 1 ? '33%' : '40%', marginTop: '3%', color: settings.DarkMode == false ? 'black' : 'white'}}>
          <Checkbox 
            style={styles.checkbox} 
            value={done} 
            onValueChange={setDone}
          />
          <Text style={styles.TaskLabel}>{settings.Language == 1 ? '  Wykonane' : '  Done'}</Text>
        </Text>
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
      <View>
        <View style={styles.DateHour}>
          <Text style={[styles.TaskLabel, {color: settings.DarkMode == false ? 'black' : 'white'}]}>{settings.Language == 1 ? 'Data' : 'Date'}</Text>
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
          <Text style={styles.ButtonAdd}>{settings.Language == 1 ? 'Edytuj' : 'Edit'}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.DeleteTask}
          onPress={() => showConfirmDialog( taskID, title )}
          >
          <Text style={styles.ButtonAdd}>{settings.Language == 1 ? 'Usuń' : 'Delete'}</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
  </View>
  )
}