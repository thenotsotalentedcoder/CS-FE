import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import notificationsReducer from './slices/notificationsSlice';
import tasksReducer from './slices/tasksSlice';
import announcementsReducer from './slices/announcementsSlice';
import resourcesReducer from './slices/resourcesSlice';
import chatReducer from './slices/chatSlice';
import adminReducer from './slices/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationsReducer,
    tasks: tasksReducer,
    announcements: announcementsReducer,
    resources: resourcesReducer,
    chat: chatReducer,
    admin: adminReducer,
  },
});
