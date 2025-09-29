// src/store/slices/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';
import { User } from '../../types';

// Define the shape of our user state
interface UserState {
  currentUser: User | null;
  users: User[];
  loading: boolean;
  error: string | null;
}

// Set the initial state for our slice
const initialState: UserState = {
  currentUser: null,
  users: [],
  loading: false,
  error: null,
};

// This is an async "thunk" for fetching all users from the API
export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const response = await apiClient('/users/');
  return response;
});

// This is an async "thunk" for fetching the currently logged-in user
export const fetchCurrentUser = createAsyncThunk('users/fetchCurrentUser', async () => {
    const response = await apiClient('/users/me');
    return response;
});

// Now we create the slice
const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    // We can add non-async actions here later if we need them
  },
  // This handles the state changes for our async thunks
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<User[]>) => {
        state.users = action.payload;
        state.loading = false;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch users';
      })
      .addCase(fetchCurrentUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
        state.currentUser = action.payload;
        state.loading = false;
      })
      .addCase(fetchCurrentUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch current user';
      });
  },
});

export default userSlice.reducer;