import { combineReducers } from 'redux';
import { configureStore } from '@reduxjs/toolkit'
import taskReducer from './reducers';

const rootReducer = combineReducers({ taskReducer });
export const Store = configureStore({reducer: rootReducer});