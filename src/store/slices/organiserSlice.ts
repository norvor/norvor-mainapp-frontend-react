import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';
import { OrganiserElement, OrganiserElementType } from '../../types';

// Define the shape of our organiser state
interface OrganiserState {
  organiserElements: OrganiserElement[];
  loading: boolean;
  error: string | null;
}

// Set the initial state
const initialState: OrganiserState = {
  organiserElements: [],
  loading: false,
  error: null,
};

// Thunk to fetch all teams and departments and merge them
export const fetchOrganiserElements = createAsyncThunk('organiser/fetchOrganiserElements', async () => {
    const [departments, teams] = await Promise.all([
        apiClient('/teams/departments/'),
        apiClient('/teams/teams/')
    ]);

    const mappedDepartments = (departments as any[]).map(dept => ({
        id: dept.id,
        parentId: null,
        type: OrganiserElementType.DEPARTMENT,
        label: dept.name,
        properties: {},
    }));

    const mappedTeams = (teams as any[]).map(team => ({
        id: team.id,
        parentId: team.department_id,
        type: OrganiserElementType.TEAM,
        label: team.name,
        properties: {},
    }));

    return [...mappedDepartments, ...mappedTeams] as OrganiserElement[];
});


// Thunk for creating a new department or team
export const createOrganiserElement = createAsyncThunk('organiser/createOrganiserElement', async (elementData: Omit<OrganiserElement, 'id'>) => {
    if (elementData.type === OrganiserElementType.DEPARTMENT) {
        const response = await apiClient('/teams/departments/', {
            method: 'POST',
            body: JSON.stringify({ name: elementData.label }),
        });
        return {
            id: (response as any).id,
            parentId: null,
            type: OrganiserElementType.DEPARTMENT,
            label: (response as any).name,
            properties: {},
        } as OrganiserElement;
    } else if (elementData.type === OrganiserElementType.TEAM) {
        const payload = {
            name: elementData.label,
            department_id: elementData.parentId,
        };
        const response = await apiClient('/teams/teams/', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        return {
            id: (response as any).id,
            parentId: (response as any).department_id,
            type: OrganiserElementType.TEAM,
            label: (response as any).name,
            properties: {},
        } as OrganiserElement;
    }
    // Fallback for other types - though not handled by the teams endpoint
    return elementData as OrganiserElement;
});


// NOTE: The backend does not currently have endpoints to update or delete teams/departments.
// The code below is set up to work if those endpoints are added in the future.

export const updateOrganiserElement = createAsyncThunk(
    'organiser/updateOrganiserElement',
    async (element: OrganiserElement) => {
        // This is a placeholder. You will need to implement the backend endpoint for this.
        console.warn("Update functionality is not yet implemented in the backend.");
        return element;
    }
);

export const deleteOrganiserElement = createAsyncThunk(
    'organiser/deleteOrganiserElement',
    async (elementId: string) => {
        // This is a placeholder. You will need to implement the backend endpoint for this.
        console.warn("Delete functionality is not yet implemented in the backend.");
        return elementId;
    }
);


// Create the slice and handle state changes
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
        state.organiserElements = action.payload;
        state.loading = false;
      })
      .addCase(fetchOrganiserElements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch organiser elements';
      })
      // Create
      .addCase(createOrganiserElement.fulfilled, (state, action: PayloadAction<OrganiserElement | undefined>) => {
        if (action.payload) {
            state.organiserElements.push(action.payload);
        }
      })
      // Update
      .addCase(updateOrganiserElement.fulfilled, (state, action: PayloadAction<OrganiserElement>) => {
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