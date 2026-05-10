import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../lib/api';

export const fetchAllStudents = createAsyncThunk(
  'admin/fetchAllStudents',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/students');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch students');
    }
  }
);

export const updateStudentGroup = createAsyncThunk(
  'admin/updateStudentGroup',
  async ({ id, group }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/students/${id}/group`, { group });
      return { id, group: data.group };
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to update group');
    }
  }
);


// New unified update action for Admin
export const adminUpdateUser = createAsyncThunk(
  'admin/updateUser',
  async ({ id, role, domain, group }, { rejectWithValue }) => {
    try {
      const { data } = await api.patch(`/api/admin/users/${id}/role-and-domain`, { role, domain, group });
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to update user');
    }
  }
);

const initialState = {
  students: [],
  loading: false,
  error: null,
};

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearAdminData: (state) => {
      state.students = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllStudents.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAllStudents.fulfilled, (state, action) => {
        state.students = action.payload;
        state.loading = false;
      })
      .addCase(fetchAllStudents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateStudentGroup.fulfilled, (state, action) => {
        const student = state.students.find(s => s.id === action.payload.id);
        if (student) student.group = action.payload.group;
      })
      .addCase(adminUpdateUser.fulfilled, (state, action) => {
        const index = state.students.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.students[index] = action.payload;
        }
      });
  },
});

export const { clearAdminData } = adminSlice.actions;

export const selectAdminStudents = (state) => state.admin.students;
export const selectAdminLoading = (state) => state.admin.loading;

export default adminSlice.reducer;
