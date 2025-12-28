/* eslint-disable no-unused-vars */
import { createContext, useContext, useState, useEffect } from 'react';
import { getMenuSidebar } from '@/config/menu.config';
import { usePermissionsContext } from './PermissionsProvider';

const initialProps = {
  configs: new Map(),
  setMenuConfig: () => {},
  getMenuConfig: () => null,
  setCurrentMenuItem: () => {},
  getCurrentMenuItem: () => null
};
const MenuContext = createContext(initialProps);
const useMenus = () => useContext(MenuContext);
const MenusProvider = ({
  children
}) => {
  const [currentMenuItem, setCurrentMenuItem] = useState(null);
  const configs = initialProps.configs;
  
  // Get permissions context
  let permissionsContext = null;
  try {
    permissionsContext = usePermissionsContext();
  } catch (error) {
    // Permissions context not available yet
  }
  
  const setMenuConfig = (name, config) => {
    configs.set(name, config);
  };
  
  const getCurrentMenuItem = () => {
    return currentMenuItem;
  };
  
  const getMenuConfig = name => {
    return configs.get(name) ?? null;
  };

  // Enhanced menu filtering function that properly filters children
  const filterMenuWithChildren = (menuItems) => {
    if (!permissionsContext?.shouldShowChild) {
      return menuItems;
    }
    
    return menuItems.filter(item => {
      // Always show headings
      if (item.heading) {
        return true;
      }
      
      // Check if the main item has permission
      const hasMainPermission = !item.key || permissionsContext?.canAccess?.(item.key);
      
      // Filter children if they exist
      if (item.children && item.children.length > 0) {
        // Apply the shouldShowChild function to each child
        const filteredChildren = item.children.filter(child => {
          const shouldShow = permissionsContext.shouldShowChild(child);
          return shouldShow;
        });
        
        // Only show parent if it has permission AND has visible children
        const shouldShowParent = hasMainPermission && filteredChildren.length > 0;
        
        // Update the children array to only include visible items
        if (shouldShowParent) {
          item.children = filteredChildren;
        }
        
        return shouldShowParent;
      }
      
      return hasMainPermission;
    });
  };

  // Set up the primary menu with permissions filtering
  useEffect(() => {
    // Get the original menu with permission filtering
    const originalMenu = getMenuSidebar(filterMenuWithChildren);
    
    // Apply enhanced filtering
    const menuConfig = filterMenuWithChildren(originalMenu);
    
    setMenuConfig('primary', menuConfig);
  }, [permissionsContext?.permissions, permissionsContext?.shouldShowChild]);

  return <MenuContext.Provider value={{
    configs,
    setMenuConfig,
    getMenuConfig,
    setCurrentMenuItem,
    getCurrentMenuItem
  }}>
      {children}
    </MenuContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export { MenusProvider, useMenus };