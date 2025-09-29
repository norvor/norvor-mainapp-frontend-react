// src/store/slices/activitySlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';
import { Activity } from '../../types';

interface ActivityState {
  activities: Activity[];
  loading: boolean;
  error: string | null;
}

const initialState: ActivityState = {
  activities: [],
  loading: false,
  error: null,
};

// Fetching activities for the entire company/team
export const fetchActivities = createAsyncThunk('activities/fetchActivities', async () => {
  const response = await apiClient('/crm/activities/');
  return response as Activity[];
});

// A thunk for adding a new activity (example mutation)
export const logActivity = createAsyncThunk('activities/logActivity', async (activityData: Omit<Activity, 'id'>) => {
    const response = await apiClient('/crm/activities/', { method: 'POST', body: JSON.stringify(activityData) });
    return response as Activity;
});


const activitySlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action: PayloadAction<Activity[]>) => {
        state.activities = action.payload;
        state.loading = false;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch activities';
      })
      .addCase(logActivity.fulfilled, (state, action: PayloadAction<Activity>) => {
        state.activities.push(action.payload);
      });
  },
});

export default activitySlice.reducer;