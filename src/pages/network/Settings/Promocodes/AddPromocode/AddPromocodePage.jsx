import { Fragment } from 'react';
// import { Link } from 'react-router-dom';
import { Container } from '@/components/container';
import { Toolbar,  ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { AddPromocodeContent } from './AddPromocodeContent';
import { useLayout } from '@/providers';
// import { SettingsSidebarMenu } from '../../SettingsSidebarMenu';

const AddPromocodePage = () => {
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
        <AddPromocodeContent />
      </Container>
    </Fragment>;
};
export { AddPromocodePage };