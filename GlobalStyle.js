import { StyleSheet } from 'react-native';

  export const styles = StyleSheet.create({
    //ScreenMain
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
    FilterErrorText: {
      color: '#909899',
      fontSize: 20,
      marginTop: 20,
      textAlign: 'center'
    },
    AddButton: {
      position: 'absolute',
      bottom: 30,
      right: 30,
      width: '17%',
      alignItems: 'center',
      borderRadius: 100,
      backgroundColor: 'blue',
    },
    plus: {
      color: '#ffffff',
      fontSize: 50,
      padding: -20
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
      textAlign: 'center'
    },
    Item: {
      marginHorizontal: '1%',
      marginVertical: '1%',
      paddingHorizontal: '1%',
      backgroundColor: '#f0f7ff',
      justifyContent: 'center'
    },
    Item_Dark: {
      color: 'white',
      marginHorizontal: '1%',
      marginVertical: '1%',
      paddingHorizontal: '1%',
      backgroundColor: '#000103',
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
      fontSize: 14,
    },
    //EditTasks
    container_Dark: {
      backgroundColor: '#141629',
      height: '100%',
    },
    Buttons: {
      alignItems: 'flex-start',
      flexDirection: 'row',
      justifyContent: 'space-evenly',
      height: 150
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
      padding: 5
    },
    DateHourButton_Dark: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginTop: 5,
      paddingRight: 40,
      borderBottomWidth: 1,
      padding: 5,
      borderColor: 'grey'
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
    InputText_Dark: {
      fontSize: 20,
      borderBottomWidth: 1,
      borderColor: 'grey',
      color: 'white',
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
    },
    iconStyle: {
      width: 20,
      height: 15
    },
    CalendarStyle: {
      textMonthFontSize: 22,
      textMonthFontWeight: 'bold',
      backgroundColor: '#ffffff',
      calendarBackground: '#ffffff',
      textSectionTitleColor: '#b6c1cd',
      textSectionTitleDisabledColor: '#d9e1e8',
      selectedDayBackgroundColor: '#00adf5',
      selectedDayTextColor: '#ffffff',
      todayTextColor: '#00adf5',
      dayTextColor: '#2d4150',
      textDisabledColor: '#d9e1e8',
      dotColor: '#00adf5',
      selectedDotColor: '#ffffff',
      arrowColor: 'orange',
      disabledArrowColor: '#d9e1e8',
      monthTextColor: '#0b146b',
    },
    CalendarStyle_Dark: {
      textMonthFontSize: 22,
      textMonthFontWeight: 'bold',
      backgroundColor: '#ffffff',
      calendarBackground: '#000',
      textSectionTitleColor: '#fff',
      textSectionTitleDisabledColor: '#d9e1e8',
      selectedDayBackgroundColor: '#fff',
      selectedDayTextColor: '#fff',
      todayTextColor: '#00adf5',
      dayTextColor: '#fff',
      textDisabledColor: '#8996a1',
      dotColor: '#00adf5',
      selectedDotColor: '#fff',
      arrowColor: 'orange',
      disabledArrowColor: '#000',
      monthTextColor: '#1194f7',
    }
  });