import { SET_TASKS, SET_TASK_ID, SET_SETTINGS } from "./actions";

const initialState = {
    tasks: [],
    taskID: 1,
    settings: {darkMode: false, language: 1}
}

function taskReducer(state = initialState, action){
    switch(action.type){
        case SET_TASKS:
            return{...state, tasks: action.payload};
        case SET_TASK_ID:
            return{...state, taskID: action.payload};
        case SET_SETTINGS:
            return{...state, settings: action.payload};       
        default:
            return state;
    }
}

export default taskReducer;