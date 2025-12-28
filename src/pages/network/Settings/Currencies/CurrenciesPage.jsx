import { Fragment } from 'react';
import { Container } from '@/components/container';
import { CurrenciesContent } from '.';
import { Toolbar,  ToolbarHeading, ToolbarPageTitle,ToolbarActions } from '@/partials/toolbar';
import { useLayout } from '@/providers';
// import { SettingsSidebarMenu } from '../SettingsSidebarMenu';
import { Link } from 'react-router-dom';


const CurrenciesPage = () => {
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
              <Link to="/addcurrency" className="btn btn-outline btn-primary cursor-pointer">
              Add Currency
                <i className="ki-filled ki-plus-squared"></i>
              </Link>
            </ToolbarActions>

      </Toolbar>
    </Container>}

      
    <Container >
        {/* <SettingsSidebarMenu /> */}
        <CurrenciesContent />
      </Container>
    </Fragment>;
};
export { CurrenciesPage };