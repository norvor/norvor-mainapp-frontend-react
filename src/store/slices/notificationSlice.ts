import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface NotificationState {
  message: string | null;
  type: 'success' | 'error';
  isVisible: boolean;
}

const initialState: NotificationState = {
  message: null,
  type: 'success',
  isVisible: false,
};

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showNotification(state, action: PayloadAction<{ message: string; type: 'success' | 'error' }>) {
      state.message = action.payload.message;
      state.type = action.payload.type;
      state.isVisible = true;
    },
    hideNotification(state) {
      state.isVisible = false;
      state.message = null;
    },
  },
});

export const { showNotification, hideNotification } = notificationSlice.actions;
export default notificationSlice.reducer;