// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import contactReducer from './slices/contactSlice';
import dealReducer from './slices/dealSlice';
import projectReducer from './slices/projectSlice';
import taskReducer from './slices/taskSlice';
import activityReducer from './slices/activitySlice'; 
import timeOffRequestReducer from './slices/timeOffRequestSlice'; 
import organiserReducer from './slices/organiserSlice'; 
// --- New Import ---
import ticketReducer from './slices/ticketSlice'; 

export const store = configureStore({
  reducer: {
    users: userReducer,
    contacts: contactReducer,
    deals: dealReducer,
    projects: projectReducer,
    tasks: taskReducer,
    activities: activityReducer,
    timeOffRequests: timeOffRequestReducer,
    organiserElements: organiserReducer,
    // --- Add the new reducer ---
    tickets: ticketReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;