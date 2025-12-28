import { Fragment } from 'react';
// import { Link } from 'react-router-dom';
import { Container } from '@/components/container';
import { Toolbar,  ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { AddSupCategoryContent } from './AddSupCategoryContent';
import { useLayout } from '@/providers';
// import { SettingsSidebarMenu } from '../../SettingsSidebarMenu';

const AddSupCategoryPage = () => {
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
        <AddSupCategoryContent />
      </Container>
    </Fragment>;
};
export { AddSupCategoryPage };