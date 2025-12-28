import { Fragment } from 'react';
// import { Link } from 'react-router-dom';
import { Container } from '@/components/container';
import { Toolbar, ToolbarDescription,ToolbarActions, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { UsersContent } from '.';
import { useLayout } from '@/providers';
import { Link } from 'react-router-dom';
import { PermissionGuard } from '@/components';

const UsersPage = () => {
  const {
    currentLayout
  } = useLayout();
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
              <PermissionGuard permissionKey="add-User" action="add">
                <Link to="/adduser" className="btn btn-outline btn-primary cursor-pointer">
                  Add User
                  <i className="ki-filled ki-plus-squared"></i>
                </Link>
              </PermissionGuard>
            </ToolbarActions>

          </Toolbar>
        </Container>}

      <PermissionGuard permissionKey="all-users" action="list">
        <Container>
          <UsersContent />
        </Container>
      </PermissionGuard>
    </Fragment>;
};
export { UsersPage };