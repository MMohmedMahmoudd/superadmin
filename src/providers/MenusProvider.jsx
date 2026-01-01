import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { getMenuSidebar } from "@/config/menu.config";
import { usePermissionsContext } from "./PermissionsProvider";

const initialProps = {
  configs: new Map(),
  setMenuConfig: (name, config) => {},
  getMenuConfig: (name) => null,
  setCurrentMenuItem: (item) => {},
  getCurrentMenuItem: () => null,
};
const MenuContext = createContext(initialProps);
const useMenus = () => useContext(MenuContext);
const MenusProvider = ({ children }) => {
  const [currentMenuItem, setCurrentMenuItem] = useState(null);
  const [configs, setConfigs] = useState(new Map());

  // Get permissions context
  let permissionsContext = null;
  try {
    permissionsContext = usePermissionsContext();
  } catch (error) {
    // Permissions context not available yet
  }

  const setMenuConfig = useCallback((name, config) => {
    setConfigs((prev) => {
      if (prev.get(name) === config) return prev;
      const next = new Map(prev);
      next.set(name, config);
      return next;
    });
  }, []);

  const getCurrentMenuItem = useCallback(() => {
    return currentMenuItem;
  }, [currentMenuItem]);

  const getMenuConfig = useCallback(
    (name) => {
      return configs.get(name) ?? null;
    },
    [configs]
  );

  // Enhanced menu filtering function that properly filters children without mutation
  const filterMenuWithChildren = (menuItems) => {
    if (!permissionsContext?.shouldShowChild) {
      return menuItems;
    }

    return menuItems
      .map((item) => {
        // Always show headings
        if (item.heading) {
          return { ...item };
        }

        // Check if the main item has permission
        const hasMainPermission =
          !item.key || permissionsContext?.canAccess?.(item.key);

        // Filter children if they exist
        if (item.children && item.children.length > 0) {
          // Recursively filter children
          const filteredChildren = filterMenuWithChildren(item.children);

          // Only show parent if it has permission AND has visible children
          const shouldShowParent =
            hasMainPermission && filteredChildren.length > 0;

          if (shouldShowParent) {
            return { ...item, children: filteredChildren };
          }

          return null;
        }

        return hasMainPermission ? { ...item } : null;
      })
      .filter((item) => item !== null);
  };

  // Set up the primary menu with permissions filtering
  useEffect(() => {
    // Get the original menu with permission filtering
    // Note: getMenuSidebar already accepts a filter function
    const menuConfig = getMenuSidebar(filterMenuWithChildren);

    setMenuConfig("primary", menuConfig);
  }, [permissionsContext?.permissions]);

  const value = useMemo(
    () => ({
      configs,
      setMenuConfig,
      getMenuConfig,
      setCurrentMenuItem,
      getCurrentMenuItem,
    }),
    [configs, setMenuConfig, getMenuConfig, getCurrentMenuItem]
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export { MenusProvider, useMenus };
