import { Fragment, useState } from 'react';
// import { Link } from 'react-router-dom';
import { Container } from '@/components/container';
import { Toolbar, ToolbarDescription,ToolbarActions, ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { TeamContent } from './';
import { useLayout } from '@/providers';
import { Link } from 'react-router-dom';
const TeamPage = () => {
  const {
    currentLayout
  } = useLayout();
  const [activeTab, setActiveTab] = useState("Members");
  return <Fragment>
      {currentLayout?.name === 'demo1-layout' && <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
              <ToolbarDescription></ToolbarDescription>
              </ToolbarHeading>
              <ToolbarActions>
                {activeTab === "Members" ? (
                  <Link to="/addmember" className="btn btn-outline btn-primary cursor-pointer">
                    Add Member
                    <i className="ki-filled ki-plus-squared"></i>
                  </Link>
                ) : activeTab === "Roles" ? (
                  <Link to="/addrole" className="btn btn-outline btn-primary cursor-pointer">
                    Add Role
                    <i className="ki-filled ki-plus-squared"></i>
                  </Link>
                ) : null}
              </ToolbarActions>
            </Toolbar>
          </Container>}

      <Container>
        <TeamContent activeTab={activeTab} setActiveTab={setActiveTab} />
      </Container>
    </Fragment>;
};
export { TeamPage };