// src/store/slices/dealSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';
import { Deal } from '../../types';

interface DealState {
  deals: Deal[];
  loading: boolean;
  error: string | null;
}

const initialState: DealState = {
  deals: [],
  loading: false,
  error: null,
};

export const fetchDeals = createAsyncThunk('deals/fetchDeals', async () => {
  const response = await apiClient('/crm/deals/');
  return response as Deal[];
});

const dealSlice = createSlice({
  name: 'deals',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDeals.fulfilled, (state, action: PayloadAction<Deal[]>) => {
        state.deals = action.payload;
        state.loading = false;
      })
      .addCase(fetchDeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch deals';
      });
  },
});

export default dealSlice.reducer;