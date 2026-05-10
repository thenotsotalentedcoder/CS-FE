import { createContext, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { supabase } from '../lib/supabaseClient.js';
import { 
  setSession, 
  fetchUserRow, 
  selectAuth, 
  selectIsAdmin, 
  selectIsStudent, 
  selectHasGroup,
  clearAuth
} from '../store/slices/authSlice.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const dispatch = useDispatch();
  const { session, user, loading } = useSelector(selectAuth);
  const isAdmin = useSelector(selectIsAdmin);
  const isStudent = useSelector(selectIsStudent);
  const hasGroup = useSelector(selectHasGroup);

  useEffect(() => {
    // Initial session load
    supabase.auth.getSession().then(({ data: { session } }) => {
      dispatch(setSession(session));
      if (session) dispatch(fetchUserRow());
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      dispatch(setSession(session));
      if (session) dispatch(fetchUserRow());
      else dispatch(clearAuth());
    });

    return () => subscription.unsubscribe();
  }, [dispatch]);

  async function signIn(email, password) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }

  async function signOut() {
    await supabase.auth.signOut();
    dispatch(clearAuth());
  }

  return (
    <AuthContext.Provider value={{ session, user, loading, isAdmin, isStudent, hasGroup, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
