// src/store/slices/docSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';

interface Doc {
    id: string;
    title: string;
    icon: string;
    parentId: string | null;
    content: string;
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
});

const toFrontendCasing = (backendResponse: any): Doc => ({
    ...backendResponse,
    parentId: backendResponse.parent_id,
});


export const fetchDocs = createAsyncThunk('docs/fetchDocs', async () => {
  const response = await apiClient('/docs/');
  return (response as any[]).map(toFrontendCasing) as Doc[];
});

export const createDoc = createAsyncThunk('docs/createDoc', async (docData: Omit<Doc, 'id'>) => {
    const payload = toBackendCasing(docData);
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