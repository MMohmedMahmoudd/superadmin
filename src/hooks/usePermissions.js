import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '@/auth/providers/JWTProvider';

// Permission mapping to match your API response structure
const PERMISSION_MAPPING = {
  // Business permissions - maps to providers
  'Bussiness': 'providers',
  'all-Business': 'providers.list',
  'add-Bussiness': 'providers.add',
  'Bussiness-Profile': 'providers.view',
  
  // Providers permissions - maps to stuff (not staff)
  'providers': 'stuff',
  'all-providers': 'stuff.list',
  'add-provider': 'stuff.add',
  'Provider-profile': 'stuff.edit',
  
  // Users permissions
  'users': 'users',
  'all-users': 'users.list',
  'add-User': 'users.add',
  'User-profile': 'users.edit',
  
  // Offers permissions
  'offers': 'offers',
  'all-Offers': 'offers.list',
  'add-Offer': 'offers.add',
  'Offer-Profile': 'offers.edit',
  'EditOffer': 'offers.edit',
  
  // Locations permissions
  'locations': 'cities', // Default to cities for locations menu
  'Countries': 'countries',
  'all-Countries': 'countries.list',
  'add-Country': 'countries.add',
  'Edit-Country': 'countries.edit',
  
  'Cities': 'cities',
  'all-Cities': 'cities.list',
  'add-City': 'cities.add',
  'Edit-City': 'cities.edit',
  
  'Zones': 'zones',
  'all-Zones': 'zones.list',
  'add-Zone': 'zones.add',
  'Edit-Zone': 'zones.edit',
  
  // Reservations permissions
  'reservations': 'bookings',
  'all-reservations': 'bookings.list',
  'add-reservation': 'bookings.add',
  'reservation-profile': 'bookings.edit',
  
  // Teams permissions
  'Teams': 'admins',
  'All-Profile': 'admins.list',
  'Add-member': 'admins.add',
  'MemberProfile': 'admins.edit',
  'Roles': 'roles',
  'All-Roles': 'roles.list',
  'Add-Role': 'roles.add',
  'Role-Profile': 'roles.edit',
  
  // Settings permissions
  'Settings': 'settings',
  'Bundles': 'settings',
  'All-Bundles': 'settings.list',
  'AddBundles': 'settings.edit',
  'Edit-Bundle': 'settings.edit',
  
  // Main Categories - maps to sp_types
  'main-categories': 'sp_types',
  'Categories': 'sp_types.list',
  'Add-Category': 'sp_types.add',
  'Edit-Category': 'sp_types.edit',
  'Delete-Category': 'sp_types.delete',
  
  // Sub Categories - maps to sp_categories
  'Sub-category': 'sp_categories',
  'All-Sub-category': 'sp_categories.list',
  'Add-Sub-category': 'sp_categories.add',
  'Edit-Sub-category': 'sp_categories.edit',
  
  'Payment-Method': 'settings',
  'allPayment-Method': 'settings.list',
  'add-Payment-Method': 'settings.edit',
  'Edit-Payment-Method': 'settings.edit',
  
  'Currencies': 'settings',
  'All-Currencies': 'settings.list',
  'Add-Currency': 'settings.edit',
  'Edit-Currency': 'settings.edit',
  
  'Promocodes': 'promocodes',
  'All-Promocodes': 'promocodes.list',
  'Add-Promocode': 'promocodes.add',
  'Edit-Promocode': 'promocodes.edit',

  'Amenities': 'settings',
  'All-Amenities': 'settings.list',
  'Add-Amenity': 'settings.edit',
  'Edit-Amenity': 'settings.edit',

  // Branches permissions (map to `branches` from API)
  'Branches': 'branches',
  'All-Branches': 'branches.list',
  'Add-Branch': 'branches.add',
  'Edit-Branch': 'branches.edit',
  'Delete-Branch': 'branches.delete',
  // Routes / specific pages
  'Branche-Profile': 'branches.view',
  'Add-Branche': 'branches.add',
};

export const usePermissions = () => {
  const [permissions, setPermissions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Always call useContext, but handle the case where it might not be available
  const authContext = useContext(AuthContext);

  // Fetch permissions when user data changes
  useEffect(() => {
    const fetchPermissions = async () => {
      if (!authContext?.currentUser) {
        setPermissions({});
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Extract permissions from the user data
        // The API response structure is: { success: true, message: "...", data: { permissions: {...} } }
        const userData = authContext.currentUser;
        let userPermissions = {};
        
        if (userData?.data?.permissions) {
          // If the response has the nested structure
          userPermissions = userData.data.permissions;
        } else if (userData?.permissions) {
          // If permissions are directly on the user object
          userPermissions = userData.permissions;
        } else if (typeof userData === 'object' && userData.permissions) {
          // Fallback
          userPermissions = userData.permissions;
        }
        
        setPermissions(userPermissions);
      } catch (err) {
        setError(err.message);
        setPermissions({});
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, [authContext?.currentUser]);

  const hasPermission = (permissionKey, action = 'menu') => {
    if (!permissions || Object.keys(permissions).length === 0) {
      return false;
    }
    
    // Get the mapped permission from the mapping
    const mappedPermission = PERMISSION_MAPPING[permissionKey];
    
    if (!mappedPermission) {
      return false;
    }
    
    // Handle nested permissions (e.g., 'stuff.menu')
    const permissionParts = mappedPermission.split('.');
    const basePermission = permissionParts[0];
    const subPermission = permissionParts[1] || action;
    
    const basePerms = permissions[basePermission];
    if (!basePerms) {
      return false;
    }
    
    // Check if the specific action is allowed
    const hasAccess = basePerms[subPermission] === 1;
    
    return hasAccess;
  };
  
  const canAccess = (permissionKey) => {
    return hasPermission(permissionKey, 'menu');
  };
  
  const canList = (permissionKey) => {
    return hasPermission(permissionKey, 'list');
  };
  
  const canAdd = (permissionKey) => {
    return hasPermission(permissionKey, 'add');
  };
  
  const canEdit = (permissionKey) => {
    return hasPermission(permissionKey, 'edit');
  };
  
  const canDelete = (permissionKey) => {
    return hasPermission(permissionKey, 'delete');
  };
  
  const canView = (permissionKey) => {
    return hasPermission(permissionKey, 'view');
  };
  
  const filterMenuByPermissions = (menuItems) => {
    return menuItems.filter(item => {
      // Always show headings
      if (item.heading) {
        return true;
      }
      
      // Check if the main item has permission
      const hasMainPermission = !item.key || canAccess(item.key);
      
      // Filter children if they exist
      if (item.children) {
        const filteredChildren = item.children.filter(child => {
          // Check specific permissions based on the menu key
          if (!child.key) {
            return true;
          }
          
          // Map specific actions to permission checks
          const key = child.key;
          let hasChildPermission = false;
          
          if (key.includes('add-') || key.includes('Add')) {
            // Check add permission
            hasChildPermission = hasPermission(key, 'add');
          } else if (key.includes('edit-') || key.includes('Edit')) {
            // Check edit permission
            hasChildPermission = hasPermission(key, 'edit');
          } else if (key.includes('delete-') || key.includes('Delete')) {
            // Check delete permission
            hasChildPermission = hasPermission(key, 'delete');
          } else if (key.includes('view-') || key.includes('View') || key.includes('Profile')) {
            // Check view permission
            hasChildPermission = hasPermission(key, 'view');
          } else if (key.includes('all-') || key.includes('All')) {
            // Check list permission
            hasChildPermission = hasPermission(key, 'list');
          } else {
            // Default to menu permission
            hasChildPermission = hasPermission(key, 'menu');
          }
          
          return hasChildPermission;
        });
        
        // Only show parent if it has children or has its own permission
        const shouldShowParent = hasMainPermission && (filteredChildren.length > 0 || !item.key);
        
        // Update the children array to only include visible items
        if (shouldShowParent) {
          item.children = filteredChildren;
        }
        
        return shouldShowParent;
      }
      
      return hasMainPermission;
    });
  };

  // Helper function to check if a specific child item should be visible
  const shouldShowChild = (childItem) => {
    if (!childItem.key) {
      return true;
    }
    
    const key = childItem.key;
    let hasChildPermission = false;
    
    if (key.includes('add-') || key.includes('Add')) {
      hasChildPermission = hasPermission(key, 'add');
    } else if (key.includes('edit-') || key.includes('Edit')) {
      hasChildPermission = hasPermission(key, 'edit');
    } else if (key.includes('delete-') || key.includes('Delete')) {
      hasChildPermission = hasPermission(key, 'delete');
    } else if (key.includes('view-') || key.includes('View') || key.includes('Profile')) {
      hasChildPermission = hasPermission(key, 'view');
    } else if (key.includes('all-') || key.includes('All')) {
      hasChildPermission = hasPermission(key, 'list');
    } else {
      hasChildPermission = hasPermission(key, 'menu');
    }
    
    return hasChildPermission;
  };
  
  return {
    permissions,
    hasPermission,
    canAccess,
    canList,
    canAdd,
    canEdit,
    canDelete,
    canView,
    filterMenuByPermissions,
    shouldShowChild,
    isAuthenticated: !!authContext?.currentUser,
    isLoading,
    error,
  };
}; 