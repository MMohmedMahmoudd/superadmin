import { Fragment } from "react";
// import { Link } from 'react-router-dom';
import { Container } from "@/components/container";
import {
  Toolbar,
  ToolbarDescription,
  ToolbarActions,
  ToolbarHeading,
  ToolbarPageTitle,
} from "@/partials/toolbar";
import { OffersContent } from ".";
import { useLayout } from "@/providers";
import { Link } from "react-router-dom";
import { PermissionGuard } from "@/components";
const OffersPage = () => {
  const { currentLayout } = useLayout();
  return (
    <Fragment>
      {currentLayout?.name === "demo1-layout" && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
              <ToolbarDescription></ToolbarDescription>
            </ToolbarHeading>
            <ToolbarActions>
              {/* <a href="#" className="btn btn-sm btn-light">
                Upload CSV
              </a> */}
              <PermissionGuard permissionKey="add-Offer" action="add">
                <Link
                  to="/addOffer"
                  className="btn btn-outline btn-primary cursor-pointer"
                >
                  Add Offer
                  <i className="ki-filled ki-plus-squared"></i>
                </Link>
              </PermissionGuard>
            </ToolbarActions>
          </Toolbar>
        </Container>
      )}

      <Container>
        <OffersContent />
      </Container>
    </Fragment>
  );
};
export { OffersPage };
