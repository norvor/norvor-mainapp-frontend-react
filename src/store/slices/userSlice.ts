// src/store/slices/userSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';
import { User, UserRole } from '../../types'; // Import UserRole
import { updateUserRole } from '../../../store/slices/userSlice'; // <-- Add this import at the top



// Define the shape of our user state
interface UserState {
  currentUser: User | null;
  users: User[];
  loading: boolean;
  error: string | null;
}

interface UserRoleUpdatePayload {
    userId: number;
    role: UserRole;
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

export const updateUserRole = createAsyncThunk('users/updateUserRole', async ({ userId, role }: UserRoleUpdatePayload, { getState }) => {
    // 1. Get the current user data from the state (to send a complete payload, standard for PUT)
    const state = getState() as { users: UserState };
    const userToUpdate = state.users.users.find(u => u.id === userId);

    if (!userToUpdate) {
        throw new Error(`User with id ${userId} not found in state.`);
    }

    // 2. Prepare payload: merge new role and adjust casing for FastAPI
    const updatedUser = { ...userToUpdate, role };
    const payload = {
        ...updatedUser,
        manager_id: updatedUser.managerId,
        // Assuming teamIds and leaveBalance are handled by the backend if sent as is
        // NOTE: The backend needs a PUT /users/{id} endpoint to succeed.
    };

    const response = await apiClient(`/users/${userId}`, { 
        method: 'PUT', 
        body: JSON.stringify(payload) 
    });
    
    // The backend should return the updated User object
    return response as User;
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
      })
      .addCase(updateUserRole.fulfilled, (state, action: PayloadAction<User>) => {
        const index = state.users.findIndex(u => u.id === action.payload.id);
        if (index !== -1) {
          // Replace the old user object with the new one
          state.users[index] = action.payload;
        }
        // Also update currentUser if the updated user is the current user
        if (state.currentUser?.id === action.payload.id) {
            state.currentUser = action.payload;
        }
      });
  },
});

export default userSlice.reducer;