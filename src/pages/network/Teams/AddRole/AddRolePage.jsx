import { Fragment } from 'react';
// import { Link } from 'react-router-dom';
import { Container } from '@/components/container';
import { Toolbar,  ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { AddRoleContent } from './AddRoleContent';
import { useLayout } from '@/providers';
const AddRolePage = () => {
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

      <Container>
        <AddRoleContent />
      </Container>
    </Fragment>;
};
export { AddRolePage };