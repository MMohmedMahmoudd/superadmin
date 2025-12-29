import MuiPhoneInput from "../AddBussiness/MuiPhoneInput";
import { useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { CitySelect } from "./CitySelect";
import { useFormik } from "formik";
import * as Yup from "yup";
import { ZoneSelect } from "./ZoneSelect";
import Select from "react-select";
import { LocationSelector } from "./LocationSelector";
import { MapContainer, TileLayer } from "react-leaflet";
import { useSnackbar } from "notistack";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Add this import

const BrancheDefaultContent = ({ provider, branchId, branch }) => {
  const { id } = useParams(); // Get the ID directly from URL params
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const formik = useFormik({
    enableReinitialize: true, // ✅ this line is important
    initialValues: {
      name: branch?.name || "",
      name_both_lang: branch?.name_both_lang.ar || "",
      phone: branch?.phone || "",
      latitude: branch?.latitude || "",
      longitude: branch?.longitude || "",
      city_uid: branch?.city?.id || "",
      city_name: branch?.city?.name || "",
      zone_uid: branch?.zone?.id || "",
      zone_name: branch?.zone?.name || "",
      country_uid: branch?.country?.id || "",
      country_name: branch?.country?.name || "",
      status: branch?.status ?? "",
      address: branch?.address || "",
      address_ar: branch?.address_both_lang.ar || "",
      main_branch: branch?.main_branch === "active" ? 1 : 0, // ✅ important
    },
    validationSchema: Yup.object({
      city_uid: Yup.string().required("City is required"),
      zone_uid: Yup.string().required("Zone is required"),
      country_uid: Yup.string().required("Country is required"),
      phone: Yup.string().required("Phone is required"),
      name: Yup.string().required("Name is required"),
      name_both_lang: Yup.string().required("Name in Arabic is required"),
      address: Yup.string().required("Address is required"),
      address_ar: Yup.string().required("Address in Arabic is required"),
      latitude: Yup.string().required("Latitude is required"),
      longitude: Yup.string().required("Longitude is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        const token = JSON.parse(
          localStorage.getItem(
            import.meta.env.VITE_APP_NAME +
              "-auth-v" +
              import.meta.env.VITE_APP_VERSION
          )
        )?.access_token;

        const updateData = {
          _method: "PUT",
          branch_name_en: values.name || "",
          branch_name_ar: values.name_both_lang || "",
          branch_address_en: values.address || "",
          branch_address_ar: values.address_ar || "",
          city_uid: values.city_uid || "",
          zone_uid: values.zone_uid || "",
          branch_phone: values.phone || "",
          branch_latitude: values.latitude || "",
          branch_longitude: values.longitude || "",
          main_branch: values.main_branch, // ✅ very important
          branch_status: values.status,
        };

        await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/branch/${branchId}/update`,
          updateData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        enqueueSnackbar("Branch updated successfully!", { variant: "success" });
        navigate(`/businessprofile/${id}?tab=Branches`);
      } catch (error) {
        console.error("❌ Failed to update branch:", error);

        enqueueSnackbar("❌ Failed to update branch.", { variant: "error" });
      } finally {
        setSubmitting(false); // ✅ stop loading after success
      }
    },
  });
  if (!provider) {
    return null;
  }
  const statusOptions = [
    { value: 1, label: "Active" },
    { value: 0, label: "Inactive" },
    { value: 2, label: "Waiting Confirmation" },
  ];
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? "dark:bg-gray-200 " // Tailwind class for hover background
        : "dark:bg-gray-200", // Tailwind class for default background
      borderColor: state.isFocused
        ? "border-hover-border" // Tailwind class for hover border
        : "border-border ", // Tailwind class for default border
      boxShadow: state.isFocused ? "shadow-focus" : "none", // Tailwind shadow class
      "&:hover": {
        borderColor: "border-hover-border", // Tailwind class for hover border
      },
      color: "var(--text)", // Tailwind class for text color
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: "var(--menu-bg)", // Tailwind classes for light/dark mode
      borderRadius: "8px", // Tailwind class for rounded corners
      boxShadow: "shadow-lg", // Tailwind class for shadow
      color: "var(--text)", // Tailwind class for text color
      // Tailwind class for max height
      scrollbarWidth: "thin", // Tailwind class for scrollbar width
      scrollbarColor: "scrollbar-thumb scrollbar-bg", // Tailwind classes for scrollbar colors
      position: "absolute",
      width: "100%",
      zIndex: 999,
      "&::-webkit-scrollbar": {
        width: "w-2", // Tailwind class for scrollbar width
      },
      "&::-webkit-scrollbar-track": {
        background: "bg-scrollbar-bg dark:bg-scrollbar-bg-dark", // Tailwind classes for light/dark mode
      },
      "&::-webkit-scrollbar-thumb": {
        background: "bg-scrollbar-thumb dark:bg-scrollbar-thumb-dark", // Tailwind classes for light/dark mode
        "&:hover": {
          background: "bg-scrollbar-hover dark:bg-scrollbar-hover-dark", // Tailwind classes for light/dark mode
        },
      },
    }),
    menuList: (provided) => ({
      ...provided,
      padding: "8px",
      zIndex: 9999,
      maxHeight: "100px", // Set maxHeight here
      overflowY: "auto", // Set overflowY here
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? "bg-option-hover dark:bg-option-hover-dark" // Tailwind classes for light/dark mode
        : "bg-menu-bg dark:bg-menu-bg-dark", // Tailwind classes for light/dark mode
      "&:hover": {
        backgroundColor: "var(--menu-w-bg) ", // Tailwind classes for light/dark mode
      },
      color: state.isSelected
        ? "text-selected-text dark:text-selected-text-dark" // Tailwind classes for light/dark mode
        : "text-text dark:text-text-dark ", // Tailwind classes for light/dark mode
      cursor: "pointer", // Tailwind class for pointer cursor
    }),
    singleValue: (provided) => ({
      ...provided,
      color: "var(--text) ", // Tailwind classes for light/dark mode
    }),
    placeholder: (provided) => ({
      ...provided,
      color: "var(--bs-gray-500)",
      fontSize: "0.875rem",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "var(--bs-gray-500)",
      "&:hover": {
        color: "var(--bs-primary)",
      },
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: "var(--bs-gray-500)",
      "&:hover": {
        color: "var(--bs-danger)",
      },
    }),
    input: (provided) => ({
      ...provided,
      color: "var(--bs-white)",
    }),
  };
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
      {branch && (
        <form onSubmit={formik.handleSubmit}>
          <div className="card mt-5 p-4">
            <h3 className="text-lg font-bold mb-3">Edit Branch #{branchId}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-1">
                <label className="form-label ">Branch Name</label>
                <input
                  className="input"
                  value={formik.values.name}
                  onChange={(e) => formik.setFieldValue("name", e.target.value)}
                />
                {formik.touched.name && formik.errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.name}
                  </p>
                )}
              </div>
              <div className="col-span-1">
                <label className="form-label ">Branch Name in Arabic</label>
                <input
                  className="input"
                  value={formik.values.name_both_lang}
                  onChange={(e) =>
                    formik.setFieldValue("name_both_lang", e.target.value)
                  }
                />
                {formik.touched.name_both_lang &&
                  formik.errors.name_both_lang && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.name_both_lang}
                    </p>
                  )}
              </div>
              <div>
                <label className="form-label mb-1">Phone Number</label>
                <MuiPhoneInput
                  value={formik.values.phone}
                  onChange={(value) => formik.setFieldValue("phone", value)}
                />
                {formik.touched.phone && formik.errors.phone && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.phone}
                  </p>
                )}
              </div>
              <div>
                <label className="form-label mb-1">Branch Status</label>
                <Select
                  className="react-select"
                  options={statusOptions}
                  value={statusOptions.find(
                    (opt) => opt.value === +formik.values.status
                  )}
                  onChange={(selected) => {
                    formik.setFieldValue("status", selected.value);
                  }}
                  placeholder="Select Status"
                  styles={customStyles}
                />
                {formik.touched.status && formik.errors.status && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.status}
                  </p>
                )}
              </div>

              <div>
                <CitySelect formik={formik} />
                {formik.touched.city_uid && formik.errors.city_uid && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.city_uid}
                  </p>
                )}
              </div>
              <div>
                <ZoneSelect formik={formik} />
                {formik.touched.zone_uid && formik.errors.zone_uid && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.zone_uid}
                  </p>
                )}
              </div>
              <div className="col-span-2">
                <label className="form-label">Enter Address in English</label>
                <input
                  className="input"
                  value={formik.values.address}
                  onChange={(e) =>
                    formik.setFieldValue("address", e.target.value)
                  }
                />
                {formik.touched.address && formik.errors.address && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.address}
                  </p>
                )}
              </div>
              <div className="col-span-2">
                <label className="form-label">Enter Address in Arabic</label>
                <input
                  className="input"
                  value={formik.values.address_ar}
                  onChange={(e) =>
                    formik.setFieldValue("address_ar", e.target.value)
                  }
                />
                {formik.touched.address_ar && formik.errors.address_ar && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.address_ar}
                  </p>
                )}
              </div>
              <div>
                <label className="form-label">Latitude</label>
                <input
                  className="input"
                  value={formik.values.latitude}
                  onChange={(e) =>
                    formik.setFieldValue("latitude", e.target.value)
                  }
                />
                {formik.touched.latitude && formik.errors.latitude && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.latitude}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label">Longitude</label>
                <input
                  className="input"
                  value={formik.values.longitude}
                  onChange={(e) =>
                    formik.setFieldValue("longitude", e.target.value)
                  }
                />
                {formik.touched.longitude && formik.errors.longitude && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.longitude}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 mt-4 col-span-2 px-4 dark:bg-gray-100 border border-gray-300 p-4 rounded-md">
                <h4 className="card-title">Make this main branch</h4>
                <label className="flex switch items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="toggle toggle-sm"
                    checked={formik.values.main_branch === 1}
                    onChange={(e) => {
                      formik.setFieldValue(
                        "main_branch",
                        e.target.checked ? 1 : 0
                      );
                    }}
                  />
                  {formik.touched.main_branch && formik.errors.main_branch && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.main_branch}
                    </p>
                  )}
                </label>
              </div>

              <div className="col-span-2">
                <MapContainer
                  center={[
                    branch.latitude ? parseFloat(branch.latitude) : 28.5,
                    branch.longitude ? parseFloat(branch.longitude) : 34.5,
                  ]}
                  zoom={13}
                  scrollWheelZoom={true}
                  className="rounded-xl w-full h-60"
                >
                  <TileLayer
                    // if need attribution you can remove @copyright
                    attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* ⬇️ LocationSelector must be inside MapContainer */}
                  <LocationSelector
                    initialPosition={
                      branch.latitude && branch.longitude
                        ? [
                            parseFloat(branch.latitude),
                            parseFloat(branch.longitude),
                          ]
                        : null
                    }
                    setLatLng={({ branch_latitude, branch_longitude }) => {
                      formik.setFieldValue("latitude", branch_latitude);
                      formik.setFieldValue("longitude", branch_longitude);
                    }}
                  />
                </MapContainer>
              </div>
              <div className="col-span-2 flex justify-end gap-2">
                <Link
                  to={`/businessprofile/${id}?tab=Branches`}
                  className="btn flex justify-center btn-outline btn-secondary w-24"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="btn flex justify-center btn-primary w-24"
                  disabled={formik.isSubmitting}
                >
                  {formik.isSubmitting ? (
                    <div
                      className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-solid border-white border-r-transparent"
                      role="status"
                    >
                      <span className="sr-only">Saving...</span>
                    </div>
                  ) : (
                    "Save"
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      )}
    </>
  );
};

BrancheDefaultContent.propTypes = {
  branchId: PropTypes.string.isRequired,
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
    }),
    name: PropTypes.string,
    description: PropTypes.string,
    commission_percentage: PropTypes.number,
    user: PropTypes.shape({
      name: PropTypes.string,
      email: PropTypes.string,
      mobile: PropTypes.string,
    }),
    branches: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
        phone: PropTypes.string,
      })
    ),
  }).isRequired,
};

export { BrancheDefaultContent };
