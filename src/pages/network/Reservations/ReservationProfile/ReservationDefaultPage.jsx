import { Fragment } from 'react';
import { Container } from '@/components/container';
import { ReservationDefaultContent } from '.';
import { Toolbar, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { useLayout } from '@/providers';


const ReservationDefaultPage = () => {
  const { currentLayout } = useLayout();



  return (
    <Fragment>
      {currentLayout?.name === 'demo1-layout' && <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
            </ToolbarHeading>
          </Toolbar>
        </Container>
      }
      

      <Container>
        <ReservationDefaultContent   />
      </Container>
    </Fragment>
  );
};

export { ReservationDefaultPage };