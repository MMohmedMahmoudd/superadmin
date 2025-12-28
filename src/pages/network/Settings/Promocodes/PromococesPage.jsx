import { Fragment } from 'react';
import { Container } from '@/components/container';
import { PromococesContent } from '.';
import { Toolbar,  ToolbarHeading, ToolbarPageTitle,ToolbarActions } from '@/partials/toolbar';
import { useLayout } from '@/providers';
// import { SettingsSidebarMenu } from '../SettingsSidebarMenu';
import { Link } from 'react-router-dom';


const PromococesPage = () => {
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
              <Link to="/addpromocode" className="btn btn-outline btn-primary cursor-pointer">
              Add Promocode
                <i className="ki-filled ki-plus-squared"></i>
              </Link>
            </ToolbarActions>

      </Toolbar>
    </Container>}

      
    <Container >
        {/* <SettingsSidebarMenu /> */}
        <PromococesContent />
      </Container>
    </Fragment>;
};
export { PromococesPage };