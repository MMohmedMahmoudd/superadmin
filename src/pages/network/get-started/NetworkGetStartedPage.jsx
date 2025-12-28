import { Fragment, useEffect, useRef } from 'react';
// import { Link } from 'react-router-dom';
import { Container } from '@/components/container';
import { Toolbar, ToolbarDescription,ToolbarActions, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { NetworkGetStartedContent } from '.';
import { useLayout } from '@/providers';
import { Link } from 'react-router-dom';
import { PermissionGuard } from '@/components';
import { useSnackbar } from 'notistack';
import { usePermissionsContext } from '@/providers/PermissionsProvider';
const NetworkGetStartedPage = () => {
  const {
    currentLayout
  } = useLayout();
  const { enqueueSnackbar } = useSnackbar();
  const { hasPermission, isAuthenticated, isLoading } = usePermissionsContext();
  const hasShownSnackbarRef = useRef(false);

  // Check permissions and show snackbar if denied
  useEffect(() => {
    const hasListPermission = hasPermission('all-providers', 'list');
    const hasAddPermission = hasPermission('add-provider', 'add');
    
    if (!isLoading && isAuthenticated && !hasShownSnackbarRef.current) {
      if (!hasListPermission && !hasAddPermission) {
        enqueueSnackbar(
          'Access denied: You don\'t have permission to access this page (Providers).', 
          { 
            variant: 'error',
            autoHideDuration: 4000
          }
        );
        hasShownSnackbarRef.current = true;
      }
    }
  }, [hasPermission, enqueueSnackbar, isLoading, isAuthenticated]);

  return <Fragment>
      {currentLayout?.name === 'demo1-layout' && <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
              <ToolbarDescription></ToolbarDescription>
              </ToolbarHeading>
              <ToolbarActions>
              {/* <a href="#" className="btn btn-sm btn-light">
                Upload CSV
              </a> */}
              <PermissionGuard permissionKey="add-provider" action="add">
                <Link to="/addprovider" className="btn btn-outline btn-primary cursor-pointer">
                Add Provider
                  <i className="ki-filled ki-plus-squared"></i>
                </Link>
              </PermissionGuard>
            </ToolbarActions>

          </Toolbar>
        </Container>}

      <PermissionGuard permissionKey="all-providers" action="list">
        <Container>
          <NetworkGetStartedContent />
        </Container>
      </PermissionGuard>
    </Fragment>;
};
export { NetworkGetStartedPage };