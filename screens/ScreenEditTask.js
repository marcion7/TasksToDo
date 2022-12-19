import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, TextInput, Alert, ScrollView} from 'react-native';
import Checkbox from 'expo-checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';
import { setTasks } from '../redux/actions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DropDownPicker from 'react-native-dropdown-picker';
import notifee, { TimestampTrigger, TriggerType, AndroidImportance} from '@notifee/react-native';

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

import { onDeleteNotification } from './ScreenMain';

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
  const dispatch = useDispatch();

// zaplanuj powiadomienie
async function onCreateTriggerNotification() {

  if (showAutostartPermisson == false) {
    const trigger: TimestampTrigger = {
      type: TriggerType.TIMESTAMP,
      timestamp: date.getTime(),
    };
  } else {
    Alert.alert(
      "Aby otrzymać powiadomienia o zadaniach należy zezwolić aplikacji na Autostart",
      "Dotyczy to niektórych producentów telefonów np. Xiaomi"
      [
        {
          text: "ZEZWÓL",
          onPress: () => {Linking.openSettings();},
          style: "cancel"
        },
        {
          text: "NIE POKAZUJ PONOWNIE",
          onPress: () => {setAutostartPermisson(false)},
          style: "cancel"
        },
        { text: "ANULUJ" }
      ]
    );
 }

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
        largeIcon: priority==1 ? require('../largeIcons/priorityL.png') : priority==2 ? require('../largeIcons/priorityM.png') : require('../largeIcons/priorityM.png'),
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
  }, [])

  // alert o usuwaniu zadania
const showConfirmDialog = ( id, title ) =>
Alert.alert(
  "Czy chcesz usunąć to zadanie?",
  title,
  [
    {
      text: "TAK",
      onPress: () => {deleteTask(id), navigation.navigate('Main')},
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
    onDeleteNotification(taskID.toString())
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

  // ustaw zadanie
  function setTask() {
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
                Alert.alert('Edytowano zadanie', title);
                if (done === false)
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
    <View style={styles.container}>
      <StatusBar barStyle = "auto" />
      <ScrollView>
        <Text style={{marginLeft: '33%', marginTop: '3%'}}>
          <Checkbox 
            style={styles.checkbox} 
            value={done} 
            onValueChange={setDone}
          />
          <Text style={styles.TaskLabel}>  Wykonane</Text>
        </Text>
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
                  onChange={onStartDateChange}
                />
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
                  placeholder="Wybierz opcje powtarzania"
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
                <Text style={styles.TaskRepeatLabel}>Tygodnie </Text>
                  <DropDownPicker
                    zIndex={4000}
                    placeholder="Wybierz tygodnie"
                    containerStyle={{width: '70%', marginTop: 10}}
                    open={showWeekRepeat}
                    value={WeekRepeat}
                    items={WeekOptions}
                    setOpen={setShowWeekRepeat}
                    setValue={setWeekRepeat}
                    listMode='SCROLLVIEW'
                  />
              </View>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text style={styles.TaskRepeatLabel}>Dni </Text>
                  <DropDownPicker
                    zIndex={3000}
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
          : Repeat == 4 ?
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
                <Text style={styles.TaskRepeatLabel}>Tygodnie </Text>
                  <DropDownPicker
                    zIndex={3000}
                    placeholder="Wybierz tygodnie"
                    containerStyle={{width: '70%', marginTop: 10}}
                    open={showWeekRepeat}
                    value={WeekRepeat}
                    items={WeekOptions}
                    setOpen={setShowWeekRepeat}
                    setValue={setWeekRepeat}
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
        <TouchableOpacity 
          style={styles.EditTask}
          onPress={setTask}
          >
          <Text style={styles.ButtonAdd}>Edytuj</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.DeleteTask}
          onPress={() => showConfirmDialog( taskID, title )}
          >
          <Text style={styles.ButtonAdd}>Usuń</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
  </View>
  )
}

  export const styles = StyleSheet.create({
    container: {
      backgroundColor: '#ffffff',
      height: '100%',
    },
    containerDark: {
      backgroundColor: '#000000',
      height: '100%',
    },
    Buttons: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      height: 150
    },
    Header: {
      color: '#ffffff',
      backgroundColor: '#0b146b',
      fontSize: 20,
      fontFace: 'tahoma',
      padding: 10
    },
    DateHour: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginRight: 15
    },
    DateHourButton: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 5,
      paddingRight: 40,
      borderBottomWidth: 1,
    },
    StartEndDatesButton: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 5,
      paddingRight: 10,
      borderBottomWidth: 1,
    },
    DateHourText: {
      fontSize: 20,
      fontWeight: '500',
      backgroundColor: '#d7dbd8',
      borderRadius: 10,
      borderWidth: 2,
      borderColor: '#d7dbd8'
    },
    TaskLabel: {
      fontWeight: 'bold',
      fontSize: 20,
      marginTop: 10,
      marginLeft: 10,
    },
    TaskRepeatLabel: {
      fontWeight: 'bold',
      fontSize: 20,
      marginTop: 10,
      marginLeft: 10,
      width: '25%'
    },
    InputText: {
      fontSize: 20,
      borderBottomWidth: 1,
      padding: 5
    },
    EditTask: {
      marginTop: 10,
      width: '40%',
      height: '40%',
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'green',
      borderRadius: 10
    },
    DeleteTask: {
      marginTop: 10,
      width: '40%',
      height: '40%',
      position: 'relative',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'red',
      borderRadius: 10
    },
    ButtonAdd: {
      fontSize: 25,
      textAlign: 'center',
    },
    checkbox: {
      transform: [{ scaleX: 1.5 }, { scaleY: 1.5 }],
    },
    checkboxText: {
      marginLeft: '3%',
      marginTop: '3%',
    },
    priority_bar: {
      flexDirection: 'row',
      height: 70,
      borderWidth: 2,
      borderRadius: 10,
      borderColor: '#555555',
      marginVertical: '3%'
    }
  });