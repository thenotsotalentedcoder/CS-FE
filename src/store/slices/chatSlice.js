import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

export const fetchChatHistory = createAsyncThunk(
  'chat/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/chat/history');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch chat history');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async (message, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/chat', { message });
      return data; // { reply, message_id, userMessage }
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to send message');
    }
  }
);

const initialState = {
  messages: [],
  loading: false,
  sending: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    clearChat: (state) => {
      state.messages = [];
      state.error = null;
    },
    addLocalMessage: (state, action) => {
      state.messages.push({
        id: Date.now().toString(),
        role: 'user',
        content: action.payload,
        created_at: new Date().toISOString()
      });
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChatHistory.fulfilled, (state, action) => {
        state.messages = action.payload;
        state.loading = false;
      })
      .addCase(fetchChatHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(sendMessage.pending, (state) => {
        state.sending = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sending = false;
        // The backend returns the full message object or just the reply
        // Assuming we need to append the assistant reply
        state.messages.push({
          id: action.payload.message_id,
          role: 'assistant',
          content: action.payload.reply,
          created_at: new Date().toISOString()
        });
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      });
  },
});

export const { clearChat, addLocalMessage } = chatSlice.actions;

export const selectChatMessages = (state) => state.chat.messages;
export const selectChatLoading = (state) => state.chat.loading;
export const selectChatSending = (state) => state.chat.sending;

export default chatSlice.reducer;
