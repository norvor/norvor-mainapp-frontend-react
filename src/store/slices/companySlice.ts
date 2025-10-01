import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';
import { Company } from '../../types';

// Helper to convert backend snake_case to frontend camelCase
const toFrontendCompany = (backendCompany: any): Company => ({
    id: backendCompany.id,
    name: backendCompany.name,
    domain: backendCompany.domain,
    organizationId: backendCompany.organization_id,
});

interface CompanyState {
  companies: Company[];
  loading: boolean;
  error: string | null;
}

const initialState: CompanyState = {
  companies: [],
  loading: false,
  error: null,
};

// Async Thunks for API interaction
export const fetchCompanies = createAsyncThunk('companies/fetchCompanies', async () => {
  const response = await apiClient('/crm/companies/');
  return (response as any[]).map(toFrontendCompany);
});

export const createCompany = createAsyncThunk('companies/createCompany', async (companyData: Omit<Company, 'id' | 'organizationId'>) => {
    const response = await apiClient('/crm/companies/', { 
        method: 'POST', 
        body: JSON.stringify(companyData) 
    });
    return toFrontendCompany(response);
});

// The slice definition
const companySlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCompanies.fulfilled, (state, action: PayloadAction<Company[]>) => {
        state.companies = action.payload;
        state.loading = false;
      })
      .addCase(fetchCompanies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch companies';
      })
      .addCase(createCompany.fulfilled, (state, action: PayloadAction<Company>) => {
        state.companies.push(action.payload);
      });
  },
});

export default companySlice.reducer;