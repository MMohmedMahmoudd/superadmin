import { Fragment } from 'react';
// import { Link } from 'react-router-dom';
import { Container } from '@/components/container';
import { Toolbar,  ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { AddBundlesContent } from './AddBundlesContent';
import { useLayout } from '@/providers';
// import { SettingsSidebarMenu } from '../../SettingsSidebarMenu';

const AddBundlesPage = () => {
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
        <AddBundlesContent />
      </Container>
    </Fragment>;
};
export { AddBundlesPage };