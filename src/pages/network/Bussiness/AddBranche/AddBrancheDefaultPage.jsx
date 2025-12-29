// AddBranchPage.jsx
import { Fragment } from "react";
import { Container } from "@/components/container";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Toolbar, ToolbarHeading, ToolbarPageTitle } from "@/partials/toolbar";
import { useLayout } from "@/providers";
import { BrancheDefaultContent } from "./BrancheDefaultContent";
import { UserProfileHero } from "../BrancheProfile/heros";
import { useSnackbar } from "notistack";

const AddBrancheDefaultPage = () => {
  const { id } = useParams();
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState(null);
  const { currentLayout } = useLayout();
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    const fetchProvider = async () => {
      try {
        const token = JSON.parse(
          localStorage.getItem(
            import.meta.env.VITE_APP_NAME +
              "-auth-v" +
              import.meta.env.VITE_APP_VERSION
          )
        )?.access_token;

        const res = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/provider/${id}/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setProvider(res.data?.data || null);
      } catch (err) {
        setError(err.message || "Failed to load provider");
      }
    };

    if (id) fetchProvider();
  }, [id]);

  if (error) return <div className="text-center text-red-500">{error}</div>;
  if (!provider)
    return (
      <div className="flex justify-center items-center min-h-[250px]">
        <div
          className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-primary"
          role="status"
        >
          <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
            Loading...
          </span>
        </div>
      </div>
    );

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
      <UserProfileHero
        initialImage={provider?.image}
        name={provider?.name}
        info={[
          { icon: "abstract-41", label: provider.type?.name || "" },
          { icon: "geolocation", city: provider.main_branch?.city.name || "" },
          {
            icon: "shop",
            label: provider.statistics?.branches_count + " Branch" || "",
          },
        ]}
        status={provider?.status} // ✅ Send current status
        onStatusChange={async (newStatus) => {
          try {
            const token = JSON.parse(
              localStorage.getItem(
                import.meta.env.VITE_APP_NAME +
                  "-auth-v" +
                  import.meta.env.VITE_APP_VERSION
              )
            )?.access_token;

            const statusMap = {
              active: 1,
              inactive: 0,
              "waiting confirmation": 2,
            };

            const sp_status = statusMap[newStatus.toLowerCase()] ?? 0;

            const updateData = {
              _method: "PUT",
              sp_name_english: provider?.name || "",
              sp_name_arabic: provider?.name || "",
              sp_description_english: provider?.description || "",
              sp_description_arabic: provider?.description || "",
              // sp_license_image: provider?.license_image || [],
              // sp_image: null ,
              sp_type_uid: provider?.type?.id || "",
              city_uid: provider?.main_branch?.city?.id || "",
              zone_uid: provider?.main_branch?.zone?.id || "",
              person_uid: provider?.user?.id || "",
              branch_name_english: provider?.main_branch?.name || "",
              branch_name_arabic: provider?.main_branch?.name || "",
              branch_email: provider?.main_branch?.email || "",
              branch_phone: provider?.main_branch?.phone || "",
              branch_address_english: provider?.main_branch?.address || "",
              branch_address_arabic: provider?.main_branch?.address || "",
              branch_latitude: provider?.main_branch?.latitude || "",
              branch_longitude: provider?.main_branch?.longitude || "",
              sp_status: sp_status,
            };

            await axios.post(
              `${import.meta.env.VITE_APP_API_URL}/provider/${provider.id}/update`,
              updateData,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "multipart/form-data",
                },
              }
            );

            enqueueSnackbar("Provider status updated successfully!", {
              variant: "success",
            });

            // Locally update status
            setProvider((prev) => ({
              ...prev,
              status: newStatus,
            }));
          } catch (error) {
            console.error("❌ Failed to update provider status:", error);
            enqueueSnackbar("Failed to update provider status.", {
              variant: "error",
            });
          }
        }}
      />
      <Container>
        <BrancheDefaultContent provider={provider} />
      </Container>
    </Fragment>
  );
};

export { AddBrancheDefaultPage };
