// src/store/slices/organiserSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';
import { OrganiserElement } from '../../types';

// 1. Define the shape of our organiser state
interface OrganiserState {
  organiserElements: OrganiserElement[];
  loading: boolean;
  error: string | null;
}

// 2. Set the initial state
const initialState: OrganiserState = {
  organiserElements: [],
  loading: false,
  error: null,
};

// 3. Create async thunks for API operations

// Thunk to fetch all organiser elements (company structure)
export const fetchOrganiserElements = createAsyncThunk('organiser/fetchOrganiserElements', async () => {
  const response = await apiClient('/organiser/elements/');
  return response as OrganiserElement[];
});

// Thunk for creating an element
export const createOrganiserElement = createAsyncThunk('organiser/createOrganiserElement', async (elementData: Omit<OrganiserElement, 'id'>) => {
    // Convert frontend camelCase (parentId) to backend snake_case (parent_id)
    const payload = {
        parent_id: elementData.parentId,
        label: elementData.label,
        type: elementData.type,
        properties: elementData.properties
    };
    const response = await apiClient('/organiser/elements/', { 
        method: 'POST', 
        body: JSON.stringify(payload) 
    });
    const backendResponse = response as any;
    // Convert back to camelCase for Redux store
    return { 
        ...backendResponse, 
        parentId: backendResponse.parent_id 
    } as OrganiserElement;
});

// Thunk for updating/moving an element
export const updateOrganiserElement = createAsyncThunk('organiser/updateOrganiserElement', async (element: OrganiserElement) => {
    const elementId = element.id;
    // Convert frontend camelCase (parentId) to backend snake_case (parent_id)
    const payload = {
        parent_id: element.parentId,
        label: element.label,
        type: element.type,
        properties: element.properties
    };
    const response = await apiClient(`/organiser/elements/${elementId}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
    });
    const backendResponse = response as any;
    // Convert back to camelCase for Redux store
    return {
        ...backendResponse,
        parentId: backendResponse.parent_id
    } as OrganiserElement;
});

// Thunk for deleting an element
export const deleteOrganiserElement = createAsyncThunk('organiser/deleteOrganiserElement', async (elementId: string) => {
    await apiClient(`/organiser/elements/${elementId}`, {
        method: 'DELETE'
    });
    return elementId; // Return ID to remove from state
});


// 4. Create the slice and handle state changes
const organiserSlice = createSlice({
  name: 'organiser',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetching Elements
      .addCase(fetchOrganiserElements.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrganiserElements.fulfilled, (state, action: PayloadAction<OrganiserElement[]>) => {
        // Map elements to ensure parentId is correctly handled
        if (state.organiserElements == undefined) {
            state.organiserElements = [];
        }
        if (action.payload == undefined) {
            action.payload = [];
        } 
        state.organiserElements = action.payload.map(el => ({ 
            ...el, 
            parentId: (el as any).parent_id || el.parentId 
        })) as OrganiserElement[];
        state.loading = false;
      })
      .addCase(fetchOrganiserElements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch organiser elements';
      })
      // Create
      .addCase(createOrganiserElement.fulfilled, (state, action: PayloadAction<OrganiserElement>) => {
          state.organiserElements.push(action.payload);
      })
      // Update
      .addCase(updateOrganiserElement.fulfilled, (state, action: PayloadAction<OrganiserElement>) => {
        if (state.organiserElements == undefined) {
            state.organiserElements = [];
        }  
        const index = state.organiserElements.findIndex(el => el.id === action.payload.id);
          if (index !== -1) {
              state.organiserElements[index] = action.payload;
          }
      })
      // Delete
      .addCase(deleteOrganiserElement.fulfilled, (state, action: PayloadAction<string>) => {
          state.organiserElements = state.organiserElements.filter(el => el.id !== action.payload);
      });
  },
});

export default organiserSlice.reducer;