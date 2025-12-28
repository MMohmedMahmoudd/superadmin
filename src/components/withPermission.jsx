import { Navigate } from 'react-router-dom';
import { useEffect, useRef } from 'react';
import { useSnackbar } from 'notistack';
import { usePermissionsContext } from '@/providers/PermissionsProvider';

const withPermission = (WrappedComponent, permissionKey, action = 'menu', fallbackContent = null) => {
  const WithPermissionComponent = (props) => {
    const { hasPermission, isAuthenticated, isLoading } = usePermissionsContext();
    const { enqueueSnackbar } = useSnackbar();
    const hasShownSnackbarRef = useRef(false);
    
    // Check if user has the required permission
    const hasAccess = hasPermission(permissionKey, action);
    
    // Show snackbar notification for access denied
    useEffect(() => {
      if (!hasAccess && !hasShownSnackbarRef.current && !isLoading && isAuthenticated) {
        enqueueSnackbar(
          `Access denied: You don't have permission to access this page (${permissionKey}).`, 
          { 
            variant: 'error',
            autoHideDuration: 4000
          }
        );
        hasShownSnackbarRef.current = true;
      }
    }, [hasAccess, enqueueSnackbar, isLoading, isAuthenticated, permissionKey]);
    
    // If loading, show a loading state or the component
    if (isLoading) {
      return <WrappedComponent {...props} />;
    }
    
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      return <Navigate to="/auth/login" replace />;
    }
    
    // If no permission key provided, allow access
    if (!permissionKey) {
      return <WrappedComponent {...props} />;
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
    
    return <WrappedComponent {...props} />;
  };
  
  WithPermissionComponent.displayName = `withPermission(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return WithPermissionComponent;
};

export { withPermission }; 