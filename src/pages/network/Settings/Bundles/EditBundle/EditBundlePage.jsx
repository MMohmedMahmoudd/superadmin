import { Fragment } from 'react';
import { Container } from '@/components/container';
import { Toolbar,  ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { useLayout } from '@/providers';
// import { SettingsSidebarMenu } from '../SettingsSidebarMenu';
import { EditBundleContent } from './EditBundleContent';


const EditBundlePage = () => {
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
        <EditBundleContent />
      </Container>
    </Fragment>;
};
export { EditBundlePage };