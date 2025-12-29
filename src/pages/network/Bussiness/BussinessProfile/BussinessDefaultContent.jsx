import { Tabs, Tab, TabsList, TabPanel } from "@/components/tabs";
import { useState } from "react";
import { OffersTable } from "./OffersTable";
import { useParams } from "react-router-dom";
import { ProviderDocuments } from "./ProviderDocuments";
import { ProviderReviewsTable } from "./ProviderReviewsTable";
import { ProviderPaymentsTable } from "./ProviderPaymentsTable";
import PropTypes from "prop-types";
import { ProviderBranchesTable } from "./ProviderBranchesTable";
import { ReservationTap } from "./ReservationTap";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { useSnackbar } from "notistack";
import MuiPhoneInput from "../AddBussiness/MuiPhoneInput";

const BussinessDefaultContent = ({ provider }) => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const tabFromURL = searchParams.get("tab") || "Information";
  const [activeTab, setActiveTab] = useState(tabFromURL);
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [branchNameEn, setBranchNameEn] = useState(
    provider.main_branch?.name_both_lang?.en || ""
  );
  const [branchNameAr, setBranchNameAr] = useState(
    provider.main_branch?.name_both_lang?.ar || ""
  );
  const [branchEmail, setBranchEmail] = useState(
    provider.main_branch?.email || ""
  );
  const [nameEn, setNameEn] = useState(provider.name || "");
  const [nameAr, setNameAr] = useState(provider.name || "");
  const [descriptionEn, setDescriptionEn] = useState(
    provider.description || ""
  );
  const [descriptionAr, setDescriptionAr] = useState(
    provider.description || ""
  );

  // Phone and country code state for the provider's user
  const [userCountryCode, setUserCountryCode] = useState(() => {
    const raw = provider.user?.country_code;
    const str = raw !== undefined && raw !== null ? String(raw) : "";
    const digits = str.replace(/[^0-9]/g, "");
    // Take first up to 4 digits as country code (most calling codes are 1–4 digits)
    return digits.slice(0, 4);
  });

  const [userMobile, setUserMobile] = useState(() => {
    const raw = provider.user?.mobile;
    const str = raw !== undefined && raw !== null ? String(raw) : "";
    const digits = str.replace(/[^0-9]/g, "");
    if (!str.startsWith("+")) {
      // No explicit country code stored, treat whole thing as local
      return digits;
    }
    const cc = digits.slice(0, 4);
    return digits.startsWith(cc) ? digits.slice(cc.length) : digits;
  });

  // Build the value expected by `mui-tel-input` (full phone number with country code)
  const providerPhoneInputValue =
    userCountryCode || userMobile
      ? `${userCountryCode ? `+${userCountryCode}` : ""}${userMobile}`
      : "";

  const mapProviderToFormData = (provider) => {
    const formData = new FormData();

    // User and provider info
    formData.append("person_uid", provider.user?.id || "");
    formData.append("sp_type_uid", provider.type?.id || "");
    formData.append("sp_name_english", nameEn);
    formData.append("sp_name_arabic", nameAr);
    formData.append("sp_description_english", descriptionEn);
    formData.append("sp_description_arabic", descriptionAr);
    formData.append(
      "sp_status",
      provider.status === "active" ? 1 : provider.status === "inactive" ? 0 : 2
    );
    formData.append("branch_name_english", branchNameEn);
    formData.append("branch_name_arabic", branchNameAr);

    // Handle image upload - only send if it's a File object (new image)
    if (provider.image instanceof File) {
      formData.append("sp_image", provider.image);
    }

    // Branch info
    const branch = provider.main_branch || {};
    formData.append(
      "branch_address_english",
      branch.address_both_lang?.en || ""
    );
    formData.append(
      "branch_address_arabic",
      branch.address_both_lang?.ar || ""
    );
    formData.append("city_uid", branch.city?.id || "");
    formData.append("zone_uid", branch.zone?.id || "");
    formData.append("branch_phone", branch.phone || "");
    formData.append("branch_latitude", branch.latitude || "");
    formData.append("branch_longitude", branch.longitude || "");
    formData.append("branch_email", branchEmail);

    // User phone & country code (same naming convention as other forms)
    if (userMobile) {
      formData.append("person_mobile", userMobile);
    }
    if (userCountryCode) {
      formData.append("country_code", userCountryCode);
    }

    // Method override for PUT
    formData.append("_method", "PUT");
    return formData;
  };

  const handleUpdateProvider = async () => {
    setLoading(true);
    if (!branchNameEn.trim() || !branchNameAr.trim()) {
      enqueueSnackbar("Branch name in both English and Arabic is required.", {
        variant: "error",
      });
      setLoading(false);
      return;
    }
    if (!branchEmail.trim()) {
      enqueueSnackbar("Branch email is required.", { variant: "error" });
      setLoading(false);
      return;
    }
    try {
      const formData = mapProviderToFormData(provider);

      const token = JSON.parse(
        localStorage.getItem(
          import.meta.env.VITE_APP_NAME +
            "-auth-v" +
            import.meta.env.VITE_APP_VERSION
        )
      )?.access_token;

      await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/provider/${provider.id}/update`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      enqueueSnackbar("Business updated successfully!", { variant: "success" });
    } catch (error) {
      enqueueSnackbar("Failed to update Business.", { variant: "error" });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  if (!provider) {
    return null;
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="card p-4 text-center">
          <h4 className="text-lg font-semibold">
            {provider.statistics?.offers_count || 0}
          </h4>
          <p className="text-sm text-gray-500">Total Offers</p>
        </div>
        <div className="card p-4 text-center">
          <h4 className="text-lg font-semibold">
            {provider.statistics?.active_offers_count || 0}
          </h4>
          <p className="text-sm text-gray-500">Active offers</p>
        </div>
        <div className="card p-4 text-center">
          <h4 className="text-lg font-semibold">
            {provider.statistics?.bookings_count || 0}
          </h4>
          <p className="text-sm text-gray-500">Bookings</p>
        </div>
        <div className="card p-4 text-center">
          <h4 className="text-lg font-semibold">
            {provider.statistics?.reviews_count || 0}
          </h4>
          <p className="text-sm text-gray-500">Reviews</p>
        </div>
        <div className="card p-4 text-center">
          <h4 className="text-lg font-semibold">
            {provider.net_profit
              ? provider.net_profit >= 1000
                ? (provider.net_profit / 1000).toFixed(1) + "k"
                : provider.net_profit
              : 0}
          </h4>
          <p className="text-sm text-gray-500">Total Earning</p>
        </div>
      </div>
      <div className="mt-5">
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
        >
          <TabsList className="flex flex-wrap">
            <Tab value="Information">Information</Tab>
            <Tab value="Provider">Provider</Tab>
            <Tab value="Offers">Offers</Tab>
            <Tab value="Documents">Documents</Tab>
            <Tab value="Reviews">Reviews</Tab>
            <Tab value="Reservations">Reservations</Tab>
            <Tab value="Branches">Branches</Tab>
            <Tab value="Payments">Payments</Tab>
          </TabsList>
          <TabPanel value="Information">
            <div className="grid grid-cols-1 mt-5 xl:grid-cols-1 gap-5 lg:gap-7.5">
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Business Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <label className="form-label mb-1">Business Type</label>
                    <input
                      className="input"
                      value={provider.type?.name || ""}
                      disabled
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="form-label mb-1">Percentage</label>
                    <input
                      className="input"
                      value={provider.commission_percentage || ""}
                      disabled
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="form-label mb-1">
                      Business Name In English
                    </label>
                    <input
                      className="input"
                      value={nameEn}
                      onChange={(e) => setNameEn(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="form-label mb-1">
                      Business Name In Arabic
                    </label>
                    <input
                      className="input"
                      value={nameAr}
                      onChange={(e) => setNameAr(e.target.value)}
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="form-label mb-1">
                      Business Description In English
                    </label>
                    <textarea
                      className="textarea text-slate-100 text-inherit"
                      value={descriptionEn}
                      onChange={(e) => setDescriptionEn(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="form-label mb-1">
                      Business Description In Arabic
                    </label>
                    <textarea
                      className="textarea text-slate-100 text-inherit"
                      value={descriptionAr}
                      onChange={(e) => setDescriptionAr(e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="form-label mb-1">
                      Branch Name In English
                    </label>
                    <input
                      className="input"
                      value={branchNameEn}
                      onChange={(e) => setBranchNameEn(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="form-label mb-1">
                      Branch Name In Arabic
                    </label>
                    <input
                      className="input"
                      value={branchNameAr}
                      onChange={(e) => setBranchNameAr(e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="form-label mb-1">Branch Email</label>
                    <input
                      className="input"
                      value={branchEmail}
                      onChange={(e) => setBranchEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel value="Provider">
            <div className="grid grid-cols-1 mt-5 xl:grid-cols-1 gap-5 lg:gap-7.5">
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">
                  Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label mb-1"> Name</label>
                    <input
                      className="input"
                      value={provider.user?.name || ""}
                    />
                  </div>
                  <div>
                    <label className="form-label mb-1"> Email</label>
                    <input
                      className="input"
                      value={provider.user?.email || ""}
                    />
                  </div>
                  <div>
                    <label className="form-label mb-1"> Phone Number</label>
                    <MuiPhoneInput
                      value={providerPhoneInputValue}
                      onChange={(value, info) => {
                        const cleaned = value.replace(/[^0-9]/g, ""); // Remove all non-digits
                        const cc =
                          info?.countryCallingCode || userCountryCode || "20"; // fallback to Egypt
                        const mobile = cleaned.startsWith(cc)
                          ? cleaned.slice(cc.length)
                          : cleaned;

                        setUserCountryCode(cc);
                        setUserMobile(mobile);
                      }}
                      defaultCountry="SA"
                      className="input"
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabPanel>
          <TabPanel value="Offers">
            <div className="grid grid-cols-1 mt-5 xl:grid-cols-1 gap-5 lg:gap-7.5">
              <OffersTable providerId={id} />{" "}
              {/* Use the URL parameter directly */}
            </div>
          </TabPanel>
          <TabPanel value="Documents">
            {/* Add your Documents content here */}
            <ProviderDocuments providerId={id} />
          </TabPanel>
          <TabPanel value="Reviews">
            <div className="grid grid-cols-1 mt-5 xl:grid-cols-1 gap-5 lg:gap-7.5">
              {/* Add your sales report content here */}
              <ProviderReviewsTable providerId={id} />
            </div>
          </TabPanel>
          <TabPanel value="Reservations">
            <div className="grid grid-cols-1 mt-5 xl:grid-cols-1 gap-5 lg:gap-7.5">
              <ReservationTap providerId={id} />
            </div>
          </TabPanel>
          <TabPanel value="Branches">
            <div className="grid grid-cols-1 mt-5 xl:grid-cols-1 gap-5 lg:gap-7.5">
              {/* Add your assigns content here */}
              <ProviderBranchesTable providerId={id} />
            </div>
          </TabPanel>
          <TabPanel value="Payments">
            <div className="grid grid-cols-1 mt-5 xl:grid-cols-1 gap-5 lg:gap-7.5">
              {/* Add your assigns content here */}
              <ProviderPaymentsTable providerId={id} provider={provider} />
            </div>
          </TabPanel>
        </Tabs>
      </div>
      {(activeTab === "Information" || activeTab === "Provider") && (
        <div className="flex mt-4 justify-end items-center">
          <button
            className="btn btn-outline btn-primary"
            onClick={handleUpdateProvider}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      )}
    </>
  );
};

BussinessDefaultContent.propTypes = {
  provider: PropTypes.shape({
    statistics: PropTypes.shape({
      offers_count: PropTypes.number,
      active_offers_count: PropTypes.number,
      bookings_count: PropTypes.number,
      reviews_count: PropTypes.number,
      branches_count: PropTypes.number,
    }),
    net_profit: PropTypes.number,
    type: PropTypes.shape({
      name: PropTypes.string,
      id: PropTypes.number,
    }),
    name: PropTypes.string,
    description: PropTypes.string,
    commission_percentage: PropTypes.number,
    status: PropTypes.string,
    id: PropTypes.number,
    image: PropTypes.string,
    user: PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string,
      email: PropTypes.string,
      mobile: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      country_code: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
    main_branch: PropTypes.shape({
      name_both_lang: PropTypes.shape({
        en: PropTypes.string,
        ar: PropTypes.string,
      }),
      address_both_lang: PropTypes.shape({
        en: PropTypes.string,
        ar: PropTypes.string,
      }),
      city: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
      }),
      zone: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
      }),
      phone: PropTypes.string,
      latitude: PropTypes.string,
      longitude: PropTypes.string,
      email: PropTypes.string,
    }),
  }).isRequired,
};

export { BussinessDefaultContent };
