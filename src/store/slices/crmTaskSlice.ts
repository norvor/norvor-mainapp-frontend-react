import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';
import { CrmTask } from '../../types';

// Helper to handle snake_case to camelCase conversion
const toFrontendCrmTask = (backendTask: any): CrmTask => ({
    id: backendTask.id,
    title: backendTask.title,
    dueDate: backendTask.due_date,
    status: backendTask.status,
    ownerId: backendTask.owner_id,
    contactId: backendTask.contact_id,
    dealId: backendTask.deal_id,
});

interface CrmTaskState {
  tasks: CrmTask[];
  loading: boolean;
  error: string | null;
}

const initialState: CrmTaskState = {
  tasks: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchCrmTasks = createAsyncThunk('crmTasks/fetchCrmTasks', async () => {
  const response = await apiClient('/crm/tasks/');
  return (response as any[]).map(toFrontendCrmTask);
});

export const createCrmTask = createAsyncThunk('crmTasks/createCrmTask', async (taskData: Omit<CrmTask, 'id'>) => {
    const payload = {
        title: taskData.title,
        due_date: taskData.dueDate,
        status: taskData.status,
        owner_id: taskData.ownerId,
        contact_id: taskData.contactId,
        deal_id: taskData.dealId,
    };
    const response = await apiClient('/crm/tasks/', { 
        method: 'POST', 
        body: JSON.stringify(payload) 
    });
    return toFrontendCrmTask(response);
});

// Slice Definition
const crmTaskSlice = createSlice({
  name: 'crmTasks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCrmTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCrmTasks.fulfilled, (state, action: PayloadAction<CrmTask[]>) => {
        state.tasks = action.payload;
        state.loading = false;
      })
      .addCase(fetchCrmTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch CRM tasks';
      })
      .addCase(createCrmTask.fulfilled, (state, action: PayloadAction<CrmTask>) => {
        state.tasks.push(action.payload);
      });
  },
});

export default crmTaskSlice.reducer;