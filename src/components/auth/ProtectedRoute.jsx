import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';

export default function ProtectedRoute({ children }) {
  const { session, user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" aria-label="Loading" />
      </div>
    );
  }

  if (!session) return <Navigate to="/login" replace />;

  // Wait until user row is loaded before rendering
  if (!user) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-5 h-5 rounded-full border-2 border-accent border-t-transparent animate-spin" aria-label="Loading" />
    </div>
  );

  return children;
}
