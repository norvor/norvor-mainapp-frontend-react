// src/store/slices/ticketSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '../../utils/apiClient';
import { Ticket } from '../../types';

// 1. Define the shape of our ticket state
interface TicketState {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
}

// 2. Set the initial state
const initialState: TicketState = {
  tickets: [],
  loading: false,
  error: null,
};

// 3. Create async thunks for API operations

// Thunk to fetch all tickets (or all tickets the user has access to)
export const fetchTickets = createAsyncThunk('tickets/fetchTickets', async () => {
  // Use a hypothetical endpoint for fetching all tickets
  const response = await apiClient('/requests/tickets/');
  return response as Ticket[];
});

// Thunk for submitting a new ticket
export const submitTicket = createAsyncThunk('tickets/submitTicket', async (ticketData: Omit<Ticket, 'id' | 'createdAt'>) => {
    const response = await apiClient('/requests/tickets/', { 
        method: 'POST', 
        body: JSON.stringify(ticketData) 
    });
    return response as Ticket;
});


// 4. Create the slice and handle state changes
const ticketSlice = createSlice({
  name: 'tickets',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetching Tickets: Pending, Fulfilled, Rejected lifecycle
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action: PayloadAction<Ticket[]>) => {
        state.tickets = action.payload;
        state.loading = false;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tickets';
      })
      // Submitting a Ticket: Fulfilled handler
      .addCase(submitTicket.fulfilled, (state, action: PayloadAction<Ticket>) => {
        // Add the new ticket to the list
        state.tickets.push(action.payload);
      });
  },
});

export default ticketSlice.reducer;