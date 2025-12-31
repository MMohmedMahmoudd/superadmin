import { Fragment } from "react";
// import { Link } from 'react-router-dom';
import { Container } from "@/components/container";
import { Toolbar, ToolbarHeading, ToolbarPageTitle } from "@/partials/toolbar";
import { AddBussinessContent } from "./";
import { useLayout } from "@/providers";
const AddBussinessPage = () => {
  const { currentLayout } = useLayout();
  return (
    <Fragment>
      {currentLayout?.name === "demo1-layout" && (
        <Container>
          <Toolbar>
            <ToolbarHeading>
              <ToolbarPageTitle />
            </ToolbarHeading>
          </Toolbar>
        </Container>
      )}

      <Container>
        <AddBussinessContent />
      </Container>
    </Fragment>
  );
};
export { AddBussinessPage };
