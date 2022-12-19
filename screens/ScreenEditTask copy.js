import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, TextInput, Alert, ScrollView, SafeAreaView} from 'react-native';
import Checkbox from 'expo-checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';
import { setTasks } from '../redux/actions';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import SelectBox from 'react-native-multi-selectbox'
import { xorBy } from 'lodash'

import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';

export default function ScreenTask({navigation}){

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isTaskRecc, setTaskRecc] = useState(false);
  const [done, setDone] = useState(false);
  const [priority, setPriority] = useState(1);
  
  const [date, setTaskDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const [TaskReccStartDate, setTaskStartDate] = useState(new Date());
  const [showStartDate, setShowStartDate] = useState(false);
  const [TaskReccEndDate, setTaskEndDate] = useState(new Date());
  const [showEndDate, setShowEndDate] = useState(false);
  const [Repeat, setRepeat] = useState({id: '1', item: 'Codziennie'});
  const [MonthsRepeat, setMonthsRepeat] = useState([])
  const [WeekRepeat, setWeekRepeat] = useState({id: '1', item: 'Wszystkie'});
  const [DaysRepeat, setDaysRepeat] = useState([])

  const { tasks, taskID } = useSelector(state => state.taskReducer);
  const dispatch = useDispatch();

  function pad(n) {return n < 10 ? "0"+n : n;}

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

const RepeatOptions = [
  {
    item: 'Codziennie',
    id: '1',
  },
  {
    item: 'Co tydzień',
    id: '2',
  },
  {
    item: 'Co miesiąc',
    id: '3',
  },
  {
    item: 'Co rok',
    id: '4',
  },
]

const MonthsOptions = [
  {
    item: 'Styczeń',
    id: '1',
  },
  {
    item: 'Luty',
    id: '2',
  },
  {
    item: 'Marzec',
    id: '3',
  },
  {
    item: 'Kwiecień',
    id: '4',
  },
  {
    item: 'Maj',
    id: '5',
  },
  {
    item: 'Czerwiec',
    id: '6',
  },
  {
    item: 'Lipiec',
    id: '7',
  },
  {
    item: 'Sierpień',
    id: '8',
  },
  {
    item: 'Wrzesień',
    id: '9',
  },
  {
    item: 'Październik',
    id: '10',
  },
  {
    item: 'Listopad',
    id: '11',
  },
  {
    item: 'Grudzień',
    id: '12',
  }
]

const WeekOptions = [
  {
    item: 'Wszystkie',
    id: '1',
  },
  {
    item: 'Co 2',
    id: '2',
  },
  {
    item: 'Co 3',
    id: '3',
  },
  {
    item: 'Co 4',
    id: '4',
  },
]

const DaysOptions = [
  {
    item: 'Poniedziałek',
    id: '1',
  },
  {
    item: 'Wtorek',
    id: '2',
  },
  {
    item: 'Środa',
    id: '3',
  },
  {
    item: 'Czwartek',
    id: '4',
  },
  {
    item: 'Piątek',
    id: '5',
  },
  {
    item: 'Sobota',
    id: '6',
  },
  {
    item: 'Niedziela',
    id: '7',
  },
]

function onRepeatChange() {
  return (item) => setRepeat(item)
}

function onMonthsRepeatChange() {
  return (item) => setMonthsRepeat(xorBy(MonthsRepeat, [item], 'id'))
}

function onWeekRepeatChange() {
  return (val) => setWeekRepeat(val)
}

function onDaysRepeatChange() {
  return (item) => setDaysRepeat(xorBy(DaysRepeat, [item], 'id'))
}

function toLocaleISOString(date) {
  return date.getFullYear() +
      '-' + pad(date.getMonth() + 1) +
      '-' + pad(date.getDate()) +
      'T' + pad(date.getHours()) +
      ':' + pad(date.getMinutes()) +
      ':' + pad(date.getSeconds());

}

const getTaskDate = (date) => {
  const d = new Date(date)
  d.setTime(d.getTime() + 60 * 60 * 1000) // dodać 1 godzinę
  const dateInMilisec = new Date(d).getTime() - 60000 // minus 1 minuta
  return dateInMilisec
}

  useEffect(() => {
    getTask();
  }, [])

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
  const setTask = () => {
    if(title.length == 0){
      Alert.alert('Niepoprawna nazwa','Pole nazwa nie może być puste!');
    }
    else if(getTaskDate(date) < new Date(Date.now() + 3600000)){ //trzeba też dodać godzinę
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
          navigation.goBack();
        })
        .catch(err => console.log(err))
      }
      catch(error){
        console.log(error);
      }
    }
  }

// ScreenMain usuwanie zadania
  // alerm o usuwaniu zadania
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
      })
      .catch(err => console.log(err))
  }

  return(
    <View style={styles.container}>
      <StatusBar barStyle = "auto" />
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
          onValueChange={setTaskRecc}
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
                  minimumDate={Date.now()}
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
            <View style={{alignItems: 'center'}}>
              <SelectBox
                  style={{textAlign: 'center'}}
                  width='32%'
                  label='Powtarzaj'
                  labelStyle={styles.RepeatText}
                  inputPlaceholder='Powtarzaj'
                  hideInputFilter='false'
                  options={RepeatOptions}
                  optionsLabelStyle={{color: 'black'}}
                  value={Repeat}
                  onChange={onRepeatChange()}
              />
            </View>
          {Repeat.id == '2' ?
            <View style={{alignItems: 'center'}}>
              <SelectBox
                  width='90%'
                  label='Dni'
                  labelStyle={styles.RepeatText}
                  inputPlaceholder='Wybierz dni'
                  hideInputFilter='false'
                  options={DaysOptions}
                  selectedValues={DaysRepeat}
                  optionsLabelStyle={{color: 'black'}}
                  onMultiSelect={onDaysRepeatChange()}
                  onTapClose={onDaysRepeatChange()}
                  isMulti
                />
            </View>
          : Repeat.id == '3' ?
            <View>
              <View style={{alignItems: 'center'}}>
                <SelectBox
                  width='32%'
                  label='Tygodnie'
                  labelStyle={styles.RepeatText}
                  inputPlaceholder='Wybierz tygodnie'
                  hideInputFilter='false'
                  options={WeekOptions}
                  optionsLabelStyle={{color: 'black'}}
                  value={WeekRepeat}
                  onChange={onWeekRepeatChange()}
                />
              </View>
              <View style={{alignItems: 'center'}}>
                <SelectBox
                  width='90%'
                  label='Dni'
                  labelStyle={styles.RepeatText}
                  inputPlaceholder='Wybierz dni'
                  hideInputFilter='false'
                  options={DaysOptions}
                  selectedValues={DaysRepeat}
                  optionsLabelStyle={{color: 'black'}}
                  onMultiSelect={onDaysRepeatChange()}
                  onTapClose={onDaysRepeatChange()}
                  isMulti
                />
              </View>
            </View>
          : Repeat.id == '4' ?
            <View>
              <View style={{alignItems: 'center'}}>
                <SelectBox
                  width='100%'
                  label='Miesiące'
                  labelStyle={styles.RepeatText}
                  inputPlaceholder='Wybierz miesiące'
                  hideInputFilter='false'
                  options={MonthsOptions}
                  selectedValues={MonthsRepeat}
                  onMultiSelect={onMonthsRepeatChange()}
                  onTapClose={onMonthsRepeatChange()}
                  isMulti
                />
              </View>
              <View style={{alignItems: 'center'}}>
                <SelectBox
                  width='32%'
                  label='Tygodnie'
                  labelStyle={styles.RepeatText}
                  inputPlaceholder='Wybierz tygodnie'
                  hideInputFilter='false'
                  options={WeekOptions}
                  optionsLabelStyle={{color: 'black'}}
                  value={WeekRepeat}
                  onChange={onWeekRepeatChange()}
                />
              </View>
              <View style={{alignItems: 'center'}}>
                <SelectBox
                  width='90%'
                  label='Dni'
                  labelStyle={styles.RepeatText}
                  inputPlaceholder='Wybierz dni'
                  hideInputFilter='false'
                  options={DaysOptions}
                  selectedValues={DaysRepeat}
                  optionsLabelStyle={{color: 'black'}}
                  onMultiSelect={onDaysRepeatChange()}
                  onTapClose={onDaysRepeatChange()}
                  isMulti
                />
              </View>
            </View>
           : ''
          }
          <View style={{flexDirection: 'row', borderBottomWidth: 1, justifyContent: 'center'}}>
            <Text style={[styles.RepeatText, {marginRight: '2%'}]}>O godzinie</Text> 
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
      justifyContent: 'space-evenly'
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
      marginLeft: 10
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
      height: '10%',
      borderWidth: 2,
      borderRadius: 10,
      borderColor: '#555555',
      marginVertical: '3%'
    },
    RepeatText: {
      color: 'black',
      fontWeight: 'bold',
      fontSize: 20,
      marginTop: '3%',
      textAlign: 'center',
      marginRight: '1%'
    },
  });