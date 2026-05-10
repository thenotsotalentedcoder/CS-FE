import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

export const fetchResources = createAsyncThunk(
  'resources/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/resources');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch resources');
    }
  }
);

export const toggleSaveResource = createAsyncThunk(
  'resources/toggleSave',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.post(`/api/resources/${id}/save`);
      return { id, isSaved: data.isSaved };
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to save resource');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const resourcesSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    clearResources: (state) => {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResources.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(toggleSaveResource.fulfilled, (state, action) => {
        const { id, isSaved } = action.payload;
        const item = state.items.find(r => r.id === id);
        if (item) item.is_saved = isSaved;
      });
  },
});

export const { clearResources } = resourcesSlice.actions;

export const selectResources = (state) => state.resources.items;
export const selectResourcesLoading = (state) => state.resources.loading;

export default resourcesSlice.reducer;
