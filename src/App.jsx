import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.jsx';
import { NotificationsProvider } from './hooks/useNotifications.jsx';
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import AdminRoute from './components/auth/AdminRoute.jsx';

// Public pages
import Landing from './pages/Landing.jsx';
import PublicResources from './pages/PublicResources.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import ResetPassword from './pages/ResetPassword.jsx';

// Student pages
import StudentDashboard from './pages/student/Dashboard.jsx';
import StudentResources from './pages/student/Resources.jsx';
import StudentTasks from './pages/student/Tasks.jsx';
import StudentTaskDetail from './pages/student/TaskDetail.jsx';
import StudentAnnouncements from './pages/student/Announcements.jsx';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard.jsx';
import AdminStudents from './pages/admin/Students.jsx';
import AdminStudentProfile from './pages/admin/StudentProfile.jsx';
import AdminAllowlist from './pages/admin/Allowlist.jsx';
import AdminResources from './pages/admin/Resources.jsx';
import AdminTasks from './pages/admin/Tasks.jsx';
import AdminTaskDetail from './pages/admin/TaskDetail.jsx';
import AdminSubmissionReview from './pages/admin/SubmissionReview.jsx';
import AdminAnnouncements from './pages/admin/Announcements.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationsProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/resources" element={<PublicResources />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Student */}
          <Route path="/dashboard" element={<ProtectedRoute><StudentDashboard /></ProtectedRoute>} />
          <Route path="/my-resources" element={<ProtectedRoute><StudentResources /></ProtectedRoute>} />
          <Route path="/my-tasks" element={<ProtectedRoute><StudentTasks /></ProtectedRoute>} />
          <Route path="/my-tasks/:id" element={<ProtectedRoute><StudentTaskDetail /></ProtectedRoute>} />
          <Route path="/announcements" element={<ProtectedRoute><StudentAnnouncements /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/students" element={<AdminRoute><AdminStudents /></AdminRoute>} />
          <Route path="/admin/students/:id" element={<AdminRoute><AdminStudentProfile /></AdminRoute>} />
          <Route path="/admin/allowlist" element={<AdminRoute><AdminAllowlist /></AdminRoute>} />
          <Route path="/admin/resources" element={<AdminRoute><AdminResources /></AdminRoute>} />
          <Route path="/admin/tasks" element={<AdminRoute><AdminTasks /></AdminRoute>} />
          <Route path="/admin/tasks/:id" element={<AdminRoute><AdminTaskDetail /></AdminRoute>} />
          <Route path="/admin/tasks/:taskId/submissions/:submissionId" element={<AdminRoute><AdminSubmissionReview /></AdminRoute>} />
          <Route path="/admin/announcements" element={<AdminRoute><AdminAnnouncements /></AdminRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </NotificationsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
