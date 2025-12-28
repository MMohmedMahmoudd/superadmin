import { Fragment } from 'react';
// import { Link } from 'react-router-dom';
import { Container } from '@/components/container';
import { Toolbar,  ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { AddCurrencyContent } from './AddCurrencyContent';
import { useLayout } from '@/providers';
// import { SettingsSidebarMenu } from '../../SettingsSidebarMenu';

const AddCurrencyPage = () => {
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
        <AddCurrencyContent />
      </Container>
    </Fragment>;
};
export { AddCurrencyPage };