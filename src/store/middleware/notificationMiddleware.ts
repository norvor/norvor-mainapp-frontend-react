import { Middleware } from '@reduxjs/toolkit';
import { showNotification } from '../slices/notificationSlice';

export const notificationMiddleware: Middleware = store => next => action => {
  // Check if the action is a rejected async thunk and has an error message
  if (action.type.endsWith('/rejected') && action.error?.message) {
    store.dispatch(showNotification({
      message: action.error.message,
      type: 'error',
    }));
  }

  return next(action);
};