import { Fragment, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Outlet, useLocation } from 'react-router';
import { useMenuCurrentItem } from '@/components/menu';
import { Footer, Header, Sidebar } from '../';
import { useMenus } from '@/providers';
import { useDemo1Layout } from '../Demo1LayoutProvider';
const Main = () => {
  const {
    layout
  } = useDemo1Layout();
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
  useEffect(() => {
    const bodyClass = document.body.classList;

    // Add a class to the body element
    bodyClass.add('demo1');
    if (layout.options.sidebar.fixed) bodyClass.add('sidebar-fixed');
    if (layout.options.sidebar.collapse) bodyClass.add('sidebar-collapse');
    if (layout.options.header.fixed) bodyClass.add('header-fixed');

    // Remove the class when the component is unmounted
    return () => {
      bodyClass.remove('demo1');
      bodyClass.remove('sidebar-fixed');
      bodyClass.remove('sidebar-collapse');
      bodyClass.remove('header-fixed');
    };
  }, [layout]);
  useEffect(() => {
    const timer = setTimeout(() => {
      document.body.classList.add('layout-initialized');
    }, 1000); // 1000 milliseconds

    // Remove the class when the component is unmounted
    return () => {
      document.body.classList.remove('layout-initialized');
      clearTimeout(timer);
    };
  }, []);
  return <Fragment>
      <Helmet>
        <title>{menuItem?.title || getPageTitleFromPath(pathname) || 'Troving Admin'}</title>
      </Helmet>

      <Sidebar />

      <div className="wrapper flex grow flex-col">
        <Header />

        <main className="grow content pt-5">
          <Outlet />
        </main>

        <Footer />
      </div>
    </Fragment>;
};
export { Main };