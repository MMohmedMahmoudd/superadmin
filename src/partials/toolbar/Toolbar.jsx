import { Tooltip } from "@mui/material";
import Svgify from "@sumcode/svgify";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
const Toolbar = ({ children }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  const isFormPage = useMemo(
    () =>
      pathname.toLocaleLowerCase().includes("/add") ||
      pathname.toLocaleLowerCase().includes("/edit") ||
      pathname.toLocaleLowerCase().includes("profile"),
    [pathname]
  );
  return (
    <div className="flex items-center justify-start gap-2 pb-7.5">
      {isFormPage && (
        <Tooltip title="Back">
          <button
            className="btn btn-icon btn-sm bg-red-500`"
            onClick={handleBack}
          >
            <Svgify IconName="arrow-left" FontWeight="stroke" />
          </button>
        </Tooltip>
      )}

      <div className="flex flex-wrap items-center justify-between w-full gap-2">
        {children}
      </div>
    </div>
  );
};
export { Toolbar };
