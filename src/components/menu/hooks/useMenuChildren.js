import { matchPath } from 'react-router-dom'; 
const useMenuChildren = (pathname, items, level) => {
  const hasActiveChild = (items) => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.path && matchPath({ path: item.path, end: true }, pathname)) {
        return true;
      } else if (item.children) {
        if (hasActiveChild(item.children)) {
          return true;
        }
      }
    }
    return false;
  };
  const getChildren = (items, level = 0, currentLevel = 0) => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.children) {
        // Check if we're at the desired level and if any child is active
        if (level === currentLevel && hasActiveChild(item.children)) {
          return item.children;
        }

        // Recursively check the children, incrementing the current level
        const children = getChildren(item.children, level, currentLevel + 1);

        // If valid children were found, return them
        if (children) {
          return children;
        }
      } else if (level === currentLevel && item.path && matchPath({ path: item.path, end: true }, pathname)) {
        return items;
      }
    }

    // Return null if no match was found at this level
    return null;
  };
  return getChildren(items, level);
};
export { useMenuChildren };