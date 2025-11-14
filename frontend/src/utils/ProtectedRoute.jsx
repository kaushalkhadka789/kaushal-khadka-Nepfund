import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { isAuthenticated, user, role } = useSelector((state) => state.auth);
  
  // Also check localStorage directly as a fallback
  const adminToken = localStorage.getItem('adminToken');
  const userToken = localStorage.getItem('userToken');
  const hasToken = adminToken || userToken;

  if (!isAuthenticated && !hasToken) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly) {
    // For admin routes, check if user is admin
    if (user?.role !== 'admin' && role !== 'admin') {
      // If admin token exists but user role doesn't match, clear it
      if (adminToken) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
      }
      return <Navigate to="/" replace />;
    }
    // Ensure admin token exists for admin routes
    if (!adminToken) {
      return <Navigate to="/login" replace />;
    }
  } else {
    // For user routes, ensure user token exists
    if (!userToken && !adminToken) {
      return <Navigate to="/login" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

