import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabaseClient';
import api from '../../lib/api';

export const fetchUserRow = createAsyncThunk(
  'auth/fetchUserRow',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await api.get('/api/auth/me');
      return data;
    } catch (err) {
      return rejectWithValue(err.response?.data || 'Failed to fetch user');
    }
  }
);

const initialState = {
  session: undefined, // undefined = loading, null = no session
  user: null,
  loading: true,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setSession: (state, action) => {
      state.session = action.payload;
      if (!action.payload) {
        state.user = null;
        state.loading = false;
      }
    },
    setUser: (state, action) => {
      state.user = action.payload;
      state.loading = false;
    },
    clearAuth: (state) => {
      state.session = null;
      state.user = null;
      state.loading = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserRow.pending, (state) => {
        // Only show loading spinner on initial load to prevent tab-switch flicker
        if (!state.user) {
          state.loading = true;
        }
      })
      .addCase(fetchUserRow.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      .addCase(fetchUserRow.rejected, (state, action) => {
        state.user = null;
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { setSession, setUser, clearAuth } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectIsAdmin = (state) => state.auth.user?.role === 'admin';
export const selectIsInstructor = (state) => state.auth.user?.role === 'instructor';
export const selectIsStudent = (state) => state.auth.user?.role === 'student';
export const selectUserDomain = (state) => state.auth.user?.domain;
export const selectHasGroup = (state) => !!state.auth.user?.group;

export default authSlice.reducer;
