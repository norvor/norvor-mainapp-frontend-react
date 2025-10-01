import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';
import { Contact } from '../../types';

// Helper function to map backend snake_case to frontend camelCase
const toFrontendContact = (backendContact: any): Contact => ({
    id: backendContact.id,
    name: backendContact.name,
    companyId: backendContact.company_id,
    email: backendContact.email,
    phone: backendContact.phone,
    ownerId: backendContact.owner_id,
    createdAt: backendContact.created_at,
});

interface ContactState {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
}

const initialState: ContactState = {
  contacts: [],
  loading: false,
  error: null,
};

export const fetchContacts = createAsyncThunk('contacts/fetchContacts', async () => {
  const response = await apiClient('/crm/contacts/');
  return (response as any[]).map(toFrontendContact);
});

export const createContact = createAsyncThunk('contacts/createContact', async (contactData: Omit<Contact, 'id' | 'createdAt'>) => {
    const payload = {
      name: contactData.name,
      company_id: contactData.companyId,
      email: contactData.email,
      phone: contactData.phone,
      owner_id: contactData.ownerId,
    };
    const response = await apiClient('/crm/contacts/', { method: 'POST', body: JSON.stringify(payload) });
    return toFrontendContact(response);
});

export const updateContact = createAsyncThunk('contacts/updateContact', async (contact: Contact) => {
    const payload = {
      name: contact.name,
      company_id: contact.companyId,
      email: contact.email,
      phone: contact.phone,
      owner_id: contact.ownerId,
    };
    const response = await apiClient(`/crm/contacts/${contact.id}`, { method: 'PUT', body: JSON.stringify(payload) });
    return toFrontendContact(response);
});

export const deleteContact = createAsyncThunk('contacts/deleteContact', async (contactId: number) => {
    await apiClient(`/crm/contacts/${contactId}`, { method: 'DELETE' });
    return contactId;
});


const contactSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetching Contacts
      .addCase(fetchContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action: PayloadAction<Contact[]>) => {
        state.contacts = action.payload;
        state.loading = false;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch contacts';
      })
      // Creating a Contact
      .addCase(createContact.fulfilled, (state, action: PayloadAction<Contact>) => {
        state.contacts.push(action.payload);
      })
      // Updating a Contact
      .addCase(updateContact.fulfilled, (state, action: PayloadAction<Contact>) => {
        const index = state.contacts.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.contacts[index] = action.payload;
        }
      })
      // Deleting a Contact
      .addCase(deleteContact.fulfilled, (state, action: PayloadAction<number>) => {
        state.contacts = state.contacts.filter(c => c.id !== action.payload);
      });
  },
});

export default contactSlice.reducer;