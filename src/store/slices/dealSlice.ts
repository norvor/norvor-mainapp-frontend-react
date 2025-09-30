import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';
import { Deal } from '../../types';

// Helper function to map backend snake_case to frontend camelCase
const toFrontendDeal = (backendDeal: any): Deal => ({
    id: backendDeal.id,
    name: backendDeal.name,
    value: backendDeal.value,
    stage: backendDeal.stage,
    contactId: backendDeal.contact_id,
    ownerId: backendDeal.owner_id,
    closeDate: backendDeal.close_date,
});

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
  return (response as any[]).map(toFrontendDeal);
});

export const createDeal = createAsyncThunk('deals/createDeal', async (dealData: Omit<Deal, 'id'>) => {
    const payload = {
        name: dealData.name,
        value: dealData.value,
        stage: dealData.stage,
        contact_id: dealData.contactId,
        owner_id: dealData.ownerId,
        close_date: dealData.closeDate,
    };
    const response = await apiClient('/crm/deals/', { method: 'POST', body: JSON.stringify(payload) });
    return toFrontendDeal(response);
});

export const updateDeal = createAsyncThunk('deals/updateDeal', async (deal: Partial<Deal> & { id: number }) => {
    const payload = {
        name: deal.name,
        value: deal.value,
        stage: deal.stage,
        contact_id: deal.contactId,
        owner_id: deal.ownerId,
        close_date: deal.closeDate,
    };
    const response = await apiClient(`/crm/deals/${deal.id}`, { method: 'PUT', body: JSON.stringify(payload) });
    return toFrontendDeal(response);
});

export const deleteDeal = createAsyncThunk('deals/deleteDeal', async (dealId: number) => {
    await apiClient(`/crm/deals/${dealId}`, { method: 'DELETE' });
    return dealId;
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
      })
      .addCase(createDeal.fulfilled, (state, action: PayloadAction<Deal>) => {
        state.deals.push(action.payload);
      })
      .addCase(updateDeal.fulfilled, (state, action: PayloadAction<Deal>) => {
        const index = state.deals.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.deals[index] = action.payload;
        }
      })
      .addCase(deleteDeal.fulfilled, (state, action: PayloadAction<number>) => {
        state.deals = state.deals.filter(d => d.id !== action.payload);
      });
  },
});

export default dealSlice.reducer;