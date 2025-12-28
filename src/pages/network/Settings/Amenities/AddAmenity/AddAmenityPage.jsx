import { Fragment } from 'react';
import { Container } from '@/components/container';
import { AddAmenityContent } from '.';
import { Toolbar, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { useLayout } from '@/providers';

const AddAmenityPage = () => {
  const {
    currentLayout
  } = useLayout();

  return <Fragment>
  {currentLayout?.name === 'demo1-layout' && <Container>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle />
        </ToolbarHeading>
      </Toolbar>
    </Container>}

      
    <Container >
        <AddAmenityContent />
      </Container>
    </Fragment>;
};
export { AddAmenityPage };
