import { Fragment } from 'react';
// import { Link } from 'react-router-dom';
import { Container } from '@/components/container';
import { Toolbar, ToolbarDescription,ToolbarActions, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { ReservationsContent } from '.';
import { useLayout } from '@/providers';
import { Link } from 'react-router-dom';
import { PermissionGuard } from '@/components';
const ReservationsPage = () => {
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
              <PermissionGuard permissionKey="add-reservation" action="add">
              <Link to="/addreservation" className="btn btn-outline btn-primary cursor-pointer">
              Add Reservation
                <i className="ki-filled ki-plus-squared"></i>
              </Link>
              </PermissionGuard>
            </ToolbarActions>

          </Toolbar>
        </Container>}

      <Container>
        <ReservationsContent />
      </Container>
    </Fragment>;
};
export { ReservationsPage };