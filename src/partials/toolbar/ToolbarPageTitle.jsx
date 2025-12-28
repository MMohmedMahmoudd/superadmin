import { useLocation } from 'react-router';
import { useMenuCurrentItem } from '@/components/menu';
import { useMenus } from '@/providers';
import PropTypes from 'prop-types';
const ToolbarPageTitle = ({
  text
}) => {
  const {
    pathname
  } = useLocation();
  const {
    getMenuConfig
  } = useMenus();
  const menuConfig = getMenuConfig('primary');
  const menuItem = useMenuCurrentItem(pathname, menuConfig);
  
  // Get page title from pathname as fallback when menu is not loaded
  const getPageTitleFromPath = (path) => {
    const pathSegments = path.split('/').filter(segment => segment);
    if (pathSegments.length === 0) return 'Dashboard';
    
    const lastSegment = pathSegments[pathSegments.length - 1];
    // Convert kebab-case or camelCase to Title Case
    const title = lastSegment
      .replace(/([A-Z])/g, ' $1') // Add space before capital letters
      .replace(/[-_]/g, ' ') // Replace hyphens/underscores with spaces
      .replace(/\b\w/g, l => l.toUpperCase()) // Capitalize first letter of each word
      .trim();
    
    return title || 'Page';
  };
  
  return <h1 className="text-xl font-medium leading-none text-gray-900">{text ?? menuItem?.title ?? getPageTitleFromPath(pathname)}</h1>;
};

ToolbarPageTitle.propTypes = {
  text: PropTypes.string
};

export { ToolbarPageTitle };