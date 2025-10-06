import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';
import { OrganiserElement, OrganiserElementType, Tool, User } from '../../types';
import { RootState } from '../store';

// Define the shape of our organiser state
interface OrganiserState {
  organiserElements: OrganiserElement[];
  loading: boolean;
  error: string | null;
}

const initialState: OrganiserState = {
  organiserElements: [],
  loading: false,
  error: null,
};

// --- READ ---
export const fetchOrganiserElements = createAsyncThunk('organiser/fetchOrganiserElements', async () => {
    const [departments, teams] = await Promise.all([
        apiClient('/teams/departments/'),
        apiClient('/teams/teams/')
    ]);

    const mappedDepartments: OrganiserElement[] = (departments as any[]).map(dept => ({
        id: dept.id,
        parentId: null,
        type: OrganiserElementType.DEPARTMENT,
        label: dept.name,
        properties: { isHrDept: dept.properties?.isHrDept || false },
    }));

    let allElements: OrganiserElement[] = [...mappedDepartments];

    (teams as any[]).forEach(team => {
        const teamElement: OrganiserElement = {
            id: team.id,
            parentId: team.department_id,
            type: OrganiserElementType.TEAM,
            label: team.name,
            properties: { 
                tools: team.tools || [],
                team_roles: team.team_roles || [] // Store full team_role objects
            },
        };
        allElements.push(teamElement);

        if (team.tools) {
            team.tools.forEach((toolId: string) => {
                allElements.push({
                    id: `${team.id}_${toolId}`,
                    parentId: team.id,
                    type: OrganiserElementType.NORVOR_TOOL,
                    label: toolId.charAt(0).toUpperCase() + toolId.slice(1),
                    properties: { tool_id: toolId },
                });
            });
        }
    });
    return allElements;
});

// --- CREATE ---
export const createOrganiserElement = createAsyncThunk(
    'organiser/createOrganiserElement',
    async (elementData: Omit<OrganiserElement, 'id'>, { dispatch }) => {
        if (elementData.type === OrganiserElementType.DEPARTMENT) {
            await apiClient('/teams/departments/', {
                method: 'POST', body: JSON.stringify({ name: elementData.label }),
            });
        } else if (elementData.type === OrganiserElementType.TEAM) {
            const payload = { name: elementData.label, department_id: elementData.parentId };
            await apiClient('/teams/teams/', {
                method: 'POST', body: JSON.stringify(payload),
            });
        }
        // After creating, refetch everything to ensure the state is consistent
        dispatch(fetchOrganiserElements());
    }
);

// --- UPDATE ---
export const updateOrganiserElement = createAsyncThunk(
    'organiser/updateOrganiserElement',
    async (element: OrganiserElement, { dispatch }) => {
        if (element.type === OrganiserElementType.DEPARTMENT) {
            await apiClient(`/teams/departments/${element.id}`, {
                method: 'PUT', body: JSON.stringify({ name: element.label }),
            });
        } else if (element.type === OrganiserElementType.TEAM) {
            await apiClient(`/teams/teams/${element.id}`, {
                method: 'PUT', body: JSON.stringify({ name: element.label, tools: element.properties.tools || [] }),
            });
        }
        dispatch(fetchOrganiserElements());
    }
);

// --- DELETE ---
export const deleteOrganiserElement = createAsyncThunk(
    'organiser/deleteOrganiserElement',
    async (element: OrganiserElement, { dispatch }) => {
        if (element.type === OrganiserElementType.DEPARTMENT) {
            await apiClient(`/teams/departments/${element.id}`, { method: 'DELETE' });
        } else if (element.type === OrganiserElementType.TEAM) {
            await apiClient(`/teams/teams/${element.id}`, { method: 'DELETE' });
        }
        // After deleting, refetch to update state
        dispatch(fetchOrganiserElements());
    }
);

// --- TEAM MEMBER MANAGEMENT ---
export const addTeamMember = createAsyncThunk(
    'organiser/addTeamMember',
    async ({ teamId, userId, role }: { teamId: string, userId: string, role: string }, { dispatch }) => {
        const payload = { team_id: teamId, user_id: userId, role };
        await apiClient('/teams/team_roles/', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
        dispatch(fetchOrganiserElements());
    }
);

export const removeTeamMember = createAsyncThunk(
    'organiser/removeTeamMember',
    async ({ teamRoleId }: { teamRoleId: string }, { dispatch }) => {
        await apiClient(`/teams/team_roles/${teamRoleId}`, { method: 'DELETE' });
        dispatch(fetchOrganiserElements());
    }
);


const organiserSlice = createSlice({
  name: 'organiser',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganiserElements.pending, (state) => { state.loading = true; })
      .addCase(fetchOrganiserElements.fulfilled, (state, action: PayloadAction<OrganiserElement[]>) => {
        state.organiserElements = action.payload;
        state.loading = false;
      })
      .addCase(fetchOrganiserElements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch elements';
      });
  },
});

export default organiserSlice.reducer;