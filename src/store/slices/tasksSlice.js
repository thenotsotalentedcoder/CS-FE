import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

export const fetchMyTasks = createAsyncThunk(
  'tasks/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/tasks/my');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch tasks');
    }
  }
);

export const fetchTaskDetail = createAsyncThunk(
  'tasks/fetchDetail',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/api/tasks/${id}`);
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch task detail');
    }
  }
);

export const submitTaskAction = createAsyncThunk(
  'tasks/submitTask',
  async ({ taskId, githubUrl, description }, { rejectWithValue }) => {
    try {
      const { data } = await api.post('/api/submissions', {
        task_id: taskId,
        github_url: githubUrl,
        description,
      });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Submission failed');
    }
  }
);

const initialState = {
  items: [],
  currentTask: null,
  loading: false,
  error: null,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    clearTasks: (state) => {
      state.items = [];
      state.currentTask = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMyTasks.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMyTasks.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(fetchMyTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchTaskDetail.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTaskDetail.fulfilled, (state, action) => {
        state.currentTask = action.payload;
        state.loading = false;
      })
      .addCase(fetchTaskDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(submitTaskAction.fulfilled, (state, action) => {
        if (state.currentTask && state.currentTask.id === action.payload.task_id) {
          state.currentTask.submission = action.payload;
        }
      });
  },
});

export const { clearTasks } = tasksSlice.actions;

export const selectTasks = (state) => state.tasks.items;
export const selectCurrentTask = (state) => state.tasks.currentTask;
export const selectTasksLoading = (state) => state.tasks.loading;

export default tasksSlice.reducer;
