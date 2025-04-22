import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ requireAdmin = false }) => {
  const { user, loading, isAuthenticated } = useContext(AuthContext);
  
  // Show loading indicator while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  // If admin required and user is not admin, redirect to board
  if (requireAdmin && !user.isAdmin) {
    return <Navigate to="/board" replace />;
  }
  
  // Otherwise, render the children
  return <Outlet />;
};

export default ProtectedRoute; 