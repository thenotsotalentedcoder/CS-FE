import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/notifications');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch notifications');
    }
  }
);

export const markNotificationRead = createAsyncThunk(
  'notifications/markRead',
  async (id, { rejectWithValue }) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to mark notification as read');
    }
  }
);

export const markAllNotificationsRead = createAsyncThunk(
  'notifications/markAllRead',
  async (_, { rejectWithValue }) => {
    try {
      await api.patch('/api/notifications/read-all');
      return true;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to mark all as read');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotifications: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(markNotificationRead.fulfilled, (state, action) => {
        const id = action.payload;
        const item = state.items.find(n => n.id === id);
        if (item) item.is_read = true;
      })
      .addCase(markAllNotificationsRead.fulfilled, (state) => {
        state.items.forEach(n => n.is_read = true);
      });
  },
});

export const { clearNotifications } = notificationsSlice.actions;

// Selectors
export const selectNotifications = (state) => state.notifications.items;
export const selectUnreadCount = (state) => state.notifications.items.filter(n => !n.is_read).length;
export const selectNotificationsLoading = (state) => state.notifications.loading;

export default notificationsSlice.reducer;
