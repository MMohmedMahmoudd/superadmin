import { Fragment } from 'react';
import { Container } from '@/components/container';
import { PaymentMethodContent } from '.';
import { Toolbar,  ToolbarHeading, ToolbarPageTitle,ToolbarActions } from '@/partials/toolbar';
import { useLayout } from '@/providers';
// import { SettingsSidebarMenu } from '../SettingsSidebarMenu';
import { Link } from 'react-router-dom';


const PaymentMethodPage = () => {


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
              <Link to="/addpaymentmethod" className="btn btn-outline btn-primary cursor-pointer">
              Add Payment Method
                <i className="ki-filled ki-plus-squared"></i>
              </Link>
            </ToolbarActions>

      </Toolbar>
    </Container>}

      
    <Container >
        {/* <SettingsSidebarMenu /> */}
        <PaymentMethodContent />
      </Container>
    </Fragment>;
};
export { PaymentMethodPage };