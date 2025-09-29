// src/store/slices/contactSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';
import { Contact } from '../../types';

// 1. Define the shape of our contact state
interface ContactState {
  contacts: Contact[];
  loading: boolean;
  error: string | null;
}

// 2. Set the initial state
const initialState: ContactState = {
  contacts: [],
  loading: false,
  error: null,
};

// 3. Create async thunks for all API operations
export const fetchContacts = createAsyncThunk('contacts/fetchContacts', async () => {
  const response = await apiClient('/crm/contacts/');
  return response as Contact[];
});

export const createContact = createAsyncThunk('contacts/createContact', async (contactData: Omit<Contact, 'id' | 'createdAt'>) => {
    const response = await apiClient('/crm/contacts/', { method: 'POST', body: JSON.stringify(contactData) });
    return response as Contact;
});

export const updateContact = createAsyncThunk('contacts/updateContact', async (contact: Contact) => {
    const response = await apiClient(`/crm/contacts/${contact.id}`, { method: 'PUT', body: JSON.stringify(contact) });
    return response as Contact;
});

export const deleteContact = createAsyncThunk('contacts/deleteContact', async (contactId: number) => {
    await apiClient(`/crm/contacts/${contactId}`, { method: 'DELETE' });
    return contactId; // Return the id to know which contact to remove from state
});


// 4. Create the slice and handle state changes
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
        state.contacts.push(action.payload); // Add the new contact to our state
      })
      // Updating a Contact
      .addCase(updateContact.fulfilled, (state, action: PayloadAction<Contact>) => {
        const index = state.contacts.findIndex(c => c.id === action.payload.id);
        if (index !== -1) {
          state.contacts[index] = action.payload; // Update the contact in our state
        }
      })
      // Deleting a Contact
      .addCase(deleteContact.fulfilled, (state, action: PayloadAction<number>) => {
        state.contacts = state.contacts.filter(c => c.id !== action.payload); // Remove the contact
      });
  },
});

export default contactSlice.reducer;