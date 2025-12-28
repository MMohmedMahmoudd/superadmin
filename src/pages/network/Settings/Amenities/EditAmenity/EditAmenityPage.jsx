import { Fragment } from 'react';
import { Container } from '@/components/container';
import { EditAmenityContent } from '.';
import { Toolbar, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { useLayout } from '@/providers';
import { useParams } from 'react-router-dom';

const EditAmenityPage = () => {
  const {
    currentLayout
  } = useLayout();
  const { id } = useParams();

  return <Fragment>
  {currentLayout?.name === 'demo1-layout' && <Container>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle />
        </ToolbarHeading>
      </Toolbar>
    </Container>}

      
    <Container >
        <EditAmenityContent amenityId={id} />
      </Container>
    </Fragment>;
};
export { EditAmenityPage };
