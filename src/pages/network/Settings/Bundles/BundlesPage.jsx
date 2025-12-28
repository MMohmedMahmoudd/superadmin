import { Fragment } from 'react';
import { Container } from '@/components/container';
import { BundlesContent } from '.';
import { Toolbar,  ToolbarHeading, ToolbarPageTitle,ToolbarActions } from '@/partials/toolbar';
import { useLayout } from '@/providers';
// import { SettingsSidebarMenu } from '../SettingsSidebarMenu';
import { Link } from 'react-router-dom';


const BundlesPage = () => {
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
              {/* <a href="#" className="btn btn-sm btn-light">
                Upload CSV
              </a> */}
              <Link to="/addbundles" className="btn btn-outline btn-primary cursor-pointer">
              Add Bundles
                <i className="ki-filled ki-plus-squared"></i>
              </Link>
            </ToolbarActions>

      </Toolbar>
    </Container>}
      
    <Container >
        {/* <SettingsSidebarMenu /> */}
        <BundlesContent />
      </Container>
    </Fragment>;
};
export { BundlesPage };