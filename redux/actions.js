export const SET_TASKS = 'SET_TASKS';
export const SET_TASK_ID = 'SET_TASK_ID';
export const SET_SETTINGS = 'SET_SETTINGS';

export const setTasks = tasks => dispatch => {
    dispatch({
        type: SET_TASKS,
        payload: tasks,
    });
};

export const setTaskID = taskID => dispatch => {
    dispatch({
        type: SET_TASK_ID,
        payload: taskID,
    });
};

export const setSettings = settings => dispatch => {
    dispatch({
        type: SET_SETTINGS,
        payload: settings,
    });
};

export const groupBy = (array, key) => {
    return array.reduce((result, currentValue) => {(
     result[currentValue[key].split('T')[0]] = result[currentValue[key].split('T')[0]] || []).push(
        currentValue
      );
      return result;
    }, {});
};