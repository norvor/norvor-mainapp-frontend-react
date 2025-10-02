// src/store/slices/timeOffRequestSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';
import { TimeOffRequest } from '../../types';

// 1. Define the shape of our time-off request state
interface TimeOffRequestState {
  timeOffRequests: TimeOffRequest[];
  loading: boolean;
  error: string | null;
}

// 2. Set the initial state
const initialState: TimeOffRequestState = {
  timeOffRequests: [],
  loading: false,
  error: null,
};

// Helper to convert data from backend (snake_case) to frontend (camelCase)
const toFrontendRequest = (req: any): TimeOffRequest => ({
    id: req.id,
    userId: req.user_id,
    type: req.type,
    startDate: req.start_date,
    endDate: req.end_date,
    status: req.status,
    reason: req.reason,
});


// 3. Create async thunks for API operations

// Thunk to fetch all time-off requests
export const fetchTimeOffRequests = createAsyncThunk('timeOffRequests/fetchTimeOffRequests', async () => {
  const response = await apiClient('/hr/requests/');
  return (response as any[]).map(toFrontendRequest);
});

// Thunk for submitting a new time-off request (mutation)
// It accepts the request data excluding the auto-generated 'id'
export const submitTimeOffRequest = createAsyncThunk('timeOffRequests/submitTimeOffRequest', async (requestData: Omit<TimeOffRequest, 'id'>) => {
    const payload = {
        user_id: requestData.userId,
        type: requestData.type,
        start_date: requestData.startDate,
        end_date: requestData.endDate,
        reason: requestData.reason,
        status: requestData.status,
    };
    const response = await apiClient('/hr/requests/', { 
        method: 'POST', 
        body: JSON.stringify(payload) 
    });
    return toFrontendRequest(response);
});


// 4. Create the slice and handle state changes
const timeOffRequestSlice = createSlice({
  name: 'timeOffRequests',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetching Requests: Pending, Fulfilled, Rejected lifecycle
      .addCase(fetchTimeOffRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTimeOffRequests.fulfilled, (state, action: PayloadAction<TimeOffRequest[]>) => {
        state.timeOffRequests = action.payload;
        state.loading = false;
      })
      .addCase(fetchTimeOffRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch time-off requests';
      })
      // Submitting a Request: Fulfilled handler
      .addCase(submitTimeOffRequest.fulfilled, (state, action: PayloadAction<TimeOffRequest>) => {
        // Add the new request to the list immediately after successful creation
        state.timeOffRequests.push(action.payload);
      });
  },
});

export default timeOffRequestSlice.reducer;