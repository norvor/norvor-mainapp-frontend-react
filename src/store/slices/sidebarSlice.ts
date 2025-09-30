import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';

// Define the shape of the data we expect from the API
interface SidebarModule {
  id: string;
  name: string;
}

interface SidebarItem {
  id: string;
  name: string;
  modules: SidebarModule[];
}

interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

export interface SidebarConfig {
  groups: SidebarGroup[];
}

// Define the state for this slice
interface SidebarState {
  config: SidebarConfig | null;
  loading: boolean;
  error: string | null;
}

const initialState: SidebarState = {
  config: null,
  loading: false,
  error: null,
};

// Create an async thunk to fetch the data
export const fetchSidebarConfig = createAsyncThunk('sidebar/fetchConfig', async () => {
  const response = await apiClient('/organizations/sidebar_config');
  return response as SidebarConfig;
});

// Create the slice
const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSidebarConfig.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSidebarConfig.fulfilled, (state, action: PayloadAction<SidebarConfig>) => {
        state.config = action.payload;
        state.loading = false;
      })
      .addCase(fetchSidebarConfig.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch sidebar configuration';
      });
  },
});

export default sidebarSlice.reducer;