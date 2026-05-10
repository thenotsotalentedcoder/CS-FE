import { createContext, useContext, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useAuth } from './useAuth.jsx';
import { 
  fetchNotifications, 
  markNotificationRead, 
  markAllNotificationsRead,
  selectNotifications,
  selectUnreadCount,
  selectNotificationsLoading,
  clearNotifications
} from '../store/slices/notificationsSlice.js';

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const dispatch = useDispatch();
  const { session } = useAuth();
  const notifications = useSelector(selectNotifications);
  const unreadCount = useSelector(selectUnreadCount);
  const loading = useSelector(selectNotificationsLoading);

  const refresh = useCallback(() => {
    if (session) {
      dispatch(fetchNotifications());
    }
  }, [session, dispatch]);

  useEffect(() => {
    if (session) refresh();
    else dispatch(clearNotifications());
  }, [session, refresh, dispatch]);

  async function markRead(id) {
    dispatch(markNotificationRead(id));
  }

  async function markAllRead() {
    dispatch(markAllNotificationsRead());
  }

  return (
    <NotificationsContext.Provider value={{ notifications, unreadCount, loading, refresh, markRead, markAllRead }}>
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  return useContext(NotificationsContext);
}
