import { Fragment } from 'react';
// import { Link } from 'react-router-dom';
import { Container } from '@/components/container';
import { Toolbar,  ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { AddCategoryContent } from './AddCategoryContent';
import { useLayout } from '@/providers';
// import { SettingsSidebarMenu } from '../../SettingsSidebarMenu';

const AddCategoryPage = () => {
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
        {/* <SettingsSidebarMenu /> */}
        <AddCategoryContent />
      </Container>
    </Fragment>;
};
export { AddCategoryPage };