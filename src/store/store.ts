import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import contactReducer from './slices/contactSlice';
import dealReducer from './slices/dealSlice';
import projectReducer from './slices/projectSlice';
import taskReducer from './slices/taskSlice';
import activityReducer from './slices/activitySlice'; 
import timeOffRequestReducer from './slices/timeOffRequestSlice'; 
import organiserReducer from './slices/organiserSlice'; 
import ticketReducer from './slices/ticketSlice'; 
import sidebarReducer from './slices/sidebarSlice'; // --- ADD THIS IMPORT ---
import docReducer from './slices/docSlice'; // --- ADDED THIS IMPORT ---


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
    tickets: ticketReducer,
    sidebar: sidebarReducer,
    docs: docReducer, // --- ADD THIS LINE ---
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;