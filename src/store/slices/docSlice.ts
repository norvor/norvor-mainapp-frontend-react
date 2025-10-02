// src/store/slices/docSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';
import { RootState } from '../store'; // Import RootState to get access to other state

interface Doc {
    id: string;
    title: string;
    icon: string;
    parentId: string | null;
    content: string;
    dataCupId: string;
}

interface DocState {
  docs: Doc[];
  loading: boolean;
  error: string | null;
}

const initialState: DocState = {
  docs: [],
  loading: false,
  error: null,
};

// Helper to convert frontend camelCase to backend snake_case and vice-versa
const toBackendCasing = (doc: any) => ({
    title: doc.title,
    icon: doc.icon,
    content: doc.content,
    parent_id: doc.parentId,
    data_cup_id: doc.dataCupId,
});

const toFrontendCasing = (backendResponse: any): Doc => ({
    id: backendResponse.id,
    title: backendResponse.title,
    icon: backendResponse.icon,
    content: backendResponse.content,
    parentId: backendResponse.parent_id,
    dataCupId: backendResponse.data_cup_id,
});


export const fetchDocs = createAsyncThunk('docs/fetchDocs', async () => {
  const response = await apiClient('/docs/');
  return (response as any[]).map(toFrontendCasing) as Doc[];
});

export const createDoc = createAsyncThunk('docs/createDoc', async (docData: Omit<Doc, 'id' | 'dataCupId'>, { getState }) => {
    const state = getState() as RootState;
    const organizationId = state.users.currentUser?.organization.id;

    if (!organizationId) {
        throw new Error("Organization ID not found for the current user.");
    }

    const payload = {
        ...toBackendCasing(docData),
        organization_id: organizationId,
        data_cup_id: "00000000-0000-0000-0000-000000000000" // Placeholder
    };
    const response = await apiClient('/docs/', { 
        method: 'POST', 
        body: JSON.stringify(payload) 
    });
    return toFrontendCasing(response);
});

export const updateDoc = createAsyncThunk('docs/updateDoc', async (doc: Doc) => {
    const docId = doc.id;
    const payload = toBackendCasing(doc);
    const response = await apiClient(`/docs/${docId}`, { 
        method: 'PUT', 
        body: JSON.stringify(payload) 
    });
    return toFrontendCasing(response);
});

export const deleteDoc = createAsyncThunk('docs/deleteDoc', async (docId: string) => {
    await apiClient(`/docs/${docId}`, { 
        method: 'DELETE' 
    });
    return docId;
});


const docSlice = createSlice({
  name: 'docs',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocs.fulfilled, (state, action: PayloadAction<Doc[]>) => {
        state.docs = action.payload;
        state.loading = false;
      })
      .addCase(fetchDocs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch documents';
      })
      .addCase(createDoc.fulfilled, (state, action: PayloadAction<Doc>) => {
        state.docs.push(action.payload);
      })
      .addCase(updateDoc.fulfilled, (state, action: PayloadAction<Doc>) => {
        const index = state.docs.findIndex(d => d.id === action.payload.id);
        if (index !== -1) {
          state.docs[index] = action.payload;
        }
      })
      .addCase(deleteDoc.fulfilled, (state, action: PayloadAction<string>) => {
        state.docs = state.docs.filter(d => d.id !== action.payload);
      });
  },
});

export default docSlice.reducer;