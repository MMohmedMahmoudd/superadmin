import { Fragment } from 'react';
// import { Link } from 'react-router-dom';
import { Container } from '@/components/container';
import { Toolbar, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { SettingsContent } from './';
import { useLayout } from '@/providers';
// import { PageNavbar } from '@/pages/network/settings';

const SettingsPage = () => {
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

      <Container className="grid grid-cols-5 gap-x-8 items-start">
        <SettingsContent />
      </Container>
    </Fragment>;
};
export { SettingsPage };