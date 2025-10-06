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
import docReducer from './slices/docSlice';
import companyReducer from './slices/companySlice';
import crmTaskReducer from './slices/crmTaskSlice';
import notificationReducer from './slices/notificationSlice';
import { notificationMiddleware } from './middleware/notificationMiddleware';

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
    docs: docReducer,
    companies: companyReducer,
    crmTasks: crmTaskReducer,
    notification: notificationReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(notificationMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;