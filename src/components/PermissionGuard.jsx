import { usePermissionsContext } from '@/providers/PermissionsProvider';

const PermissionGuard = ({ 
  children, 
  permissionKey, 
  action = 'menu', 
  fallback = null,
  showIfNoPermission = false,
  showWhileLoading = false
}) => {
  const { hasPermission, isAuthenticated, isLoading } = usePermissionsContext();
  
  // If loading and showWhileLoading is true, show children
  if (isLoading && showWhileLoading) {
    return children;
  }
  
  // If loading and showWhileLoading is false, show fallback
  if (isLoading) {
    return fallback;
  }
  
  // If not authenticated, show fallback
  if (!isAuthenticated) {
    return fallback;
  }
  
  // If no permission key provided, always show children
  if (!permissionKey) {
    return children;
  }
  
  const hasAccess = hasPermission(permissionKey, action);
  
  // If showIfNoPermission is true, show children when user doesn't have permission
  if (showIfNoPermission) {
    return hasAccess ? fallback : children;
  }
  
  // Default behavior: show children only if user has permission
  return hasAccess ? children : fallback;
};

export { PermissionGuard }; 