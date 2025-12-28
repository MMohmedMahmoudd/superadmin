import { Navigate } from 'react-router-dom';
import { usePermissionsContext } from '@/providers/PermissionsProvider';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ 
  children, 
  permissionKey, 
  action = 'menu',
  fallbackContent = null
}) => {
  const { hasPermission, isAuthenticated, isLoading } = usePermissionsContext();
  
  // Check if user has the required permission
  const hasAccess = hasPermission(permissionKey, action);
  
  // Show snackbar notification for access denied
  
  // If loading, show a loading spinner
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading permissions...</p>
        </div>
      </div>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }
  
  // If no permission key provided, allow access
  if (!permissionKey) {
    return children;
  }
  
  if (!hasAccess) {
    // Show fallback content instead of redirecting
    return fallbackContent || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
        </div>
      </div>
    );
  }
  
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  permissionKey: PropTypes.string,
  action: PropTypes.string,
  fallbackContent: PropTypes.node
};

export { ProtectedRoute }; 