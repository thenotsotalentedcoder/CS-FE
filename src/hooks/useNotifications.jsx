import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../lib/api.js';
import { useAuth } from './useAuth.jsx';

const NotificationsContext = createContext(null);

export function NotificationsProvider({ children }) {
  const { session } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const refresh = useCallback(async () => {
    if (!session) return;
    setLoading(true);
    try {
      const { data } = await api.get('/api/notifications');
      setNotifications(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session) refresh();
    else setNotifications([]);
  }, [session, refresh]);

  async function markRead(id) {
    await api.patch(`/api/notifications/${id}/read`);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  }

  async function markAllRead() {
    await api.patch('/api/notifications/read-all');
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
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
