// src/store/slices/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';
import { User, UserRole } from '../../types';

// Define the shape of our user state
interface UserState {
  currentUser: User | null;
  users: User[];
  loading: boolean;
  error: string | null;
}

interface UserRoleUpdatePayload {
    userId: string;
    role: UserRole;
}

interface UserDetailsUpdatePayload {
    userId: string;
    update: Partial<User>;
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
  return response as User[];
});

// This is an async "thunk" for fetching the currently logged-in user
export const fetchCurrentUser = createAsyncThunk('users/fetchCurrentUser', async () => {
    const response = await apiClient('/users/me');
    return response as User;
});

// Generic thunk for updating any user details
export const updateUserDetails = createAsyncThunk(
  'users/updateUserDetails',
  async ({ userId, update }: UserDetailsUpdatePayload) => {
    
    // Convert camelCase keys in the update payload to snake_case for the backend
    const backendUpdatePayload: { [key: string]: any } = {};
    for (const key in update) {
        if (Object.prototype.hasOwnProperty.call(update, key)) {
            const snakeCaseKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
            backendUpdatePayload[snakeCaseKey] = (update as any)[key];
        }
    }

    const response = await apiClient(`/users/${userId}`, { 
        method: 'PUT', 
        body: JSON.stringify(backendUpdatePayload) 
    });
    
    return response as User;
  }
);

// Specific thunk for updating user role, which uses the generic update thunk
export const updateUserRole = createAsyncThunk(
    'users/updateUserRole', 
    async ({ userId, role }: UserRoleUpdatePayload, { dispatch }) => {
        const result = await dispatch(updateUserDetails({ userId, update: { role } }));
        return result.payload as User;
    }
);

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
      })
      .addCase(updateUserDetails.fulfilled, (state, action: PayloadAction<User>) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser?.id === action.payload.id) {
            state.currentUser = action.payload;
        }
      })
      .addCase(updateUserRole.fulfilled, (state, action: PayloadAction<User>) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.currentUser?.id === action.payload.id) {
            state.currentUser = action.payload;
        }
      });
  },
});

export default userSlice.reducer;