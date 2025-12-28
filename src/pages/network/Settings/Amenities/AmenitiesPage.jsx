import { Fragment } from 'react';
import { Container } from '@/components/container';
import { AmenitiesContent } from '.';
import { Toolbar,  ToolbarHeading, ToolbarPageTitle,ToolbarActions } from '@/partials/toolbar';
import { useLayout } from '@/providers';
import { Link } from 'react-router-dom';

const AmenitiesPage = () => {
  const {
    currentLayout
  } = useLayout();

  return <Fragment>
  {currentLayout?.name === 'demo1-layout' && <Container>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle />
        </ToolbarHeading>
        <ToolbarActions>
              <Link to="/AddAmenity" className="btn btn-outline btn-primary cursor-pointer">
              Add New Amenities
                <i className="ki-filled ki-plus-squared"></i>
              </Link>
            </ToolbarActions>

      </Toolbar>
    </Container>}

      
    <Container >
        <AmenitiesContent />
      </Container>
    </Fragment>;
};
export { AmenitiesPage };
