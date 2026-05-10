import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

export const fetchAnnouncements = createAsyncThunk(
  'announcements/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/announcements');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch announcements');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const announcementsSlice = createSlice({
  name: 'announcements',
  initialState,
  reducers: {
    clearAnnouncements: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAnnouncements.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAnnouncements.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchAnnouncements.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearAnnouncements } = announcementsSlice.actions;

export const selectAnnouncements = (state) => state.announcements.items;
export const selectAnnouncementsLoading = (state) => state.announcements.loading;

export default announcementsSlice.reducer;
