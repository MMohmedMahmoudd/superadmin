import { Link, useParams } from "react-router-dom";
import PropTypes from "prop-types";
import { LocationSelector } from "./LocationSelector";
import { MapContainer, TileLayer } from "react-leaflet";
import { CitySelect } from "./CitySelect";
import { ZoneSelect } from "./ZoneSelect";
import MuiPhoneInput from "../AddBussiness/MuiPhoneInput";
import Select from "react-select";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";

const BrancheDefaultContent = ({ provider }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      name: "",
      name_ar: "",
      phone: "",
      latitude: "",
      longitude: "",
      city_uid: "",
      city_name: "",
      zone_uid: "",
      zone_name: "",
      country_uid: "",
      country_name: "",
      status: "",
      address: "",
      address_ar: "",
      main_branch: 0,
    },
    validationSchema: Yup.object({
      city_uid: Yup.string().required("City is required"),
      zone_uid: Yup.string().required("Zone is required"),
      phone: Yup.string().required("Phone is required"),
      status: Yup.string().required("Status is required"),
      name: Yup.string().required("Name is required"),
      name_ar: Yup.string().required("Name in Arabic is required"),
      address: Yup.string().required("Address is required"),
      address_ar: Yup.string().required("Address in Arabic is required"),
      latitude: Yup.string().required("Latitude is required"),
      longitude: Yup.string().required("Longitude is required"),
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      try {
        const token = JSON.parse(
          localStorage.getItem(
            import.meta.env.VITE_APP_NAME +
              "-auth-v" +
              import.meta.env.VITE_APP_VERSION
          )
        )?.access_token;

        const formData = new FormData();
        formData.append("branch_name_en", values.name);
        formData.append("branch_name_ar", values.name_ar);
        formData.append("branch_address_en", values.address);
        formData.append("branch_address_ar", values.address_ar);
        formData.append("city_uid", values.city_uid);
        formData.append("zone_uid", values.zone_uid);
        formData.append("branch_phone", values.phone);
        formData.append("branch_latitude", values.latitude);
        formData.append("branch_longitude", values.longitude);
        formData.append("main_branch", values.main_branch);
        formData.append("branch_status", values.status);

        await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/provider/${id}/branch/create`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        enqueueSnackbar(" Branch created successfully.", {
          variant: "success",
        });

        resetForm(); // ✅ Reset the form after success

        // Optional: navigate to branches list
        navigate(`/businessprofile/${id}?tab=Branches`);
      } catch (error) {
        console.error("❌ Error creating branch:", error);

        // If backend sends validation message, show it
        const apiError =
          error.response?.data?.message || "Error creating branch";
        enqueueSnackbar(`❌ ${apiError}`, { variant: "error" });
      } finally {
        setSubmitting(false);
      }
    },
  });

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
      <div className="card mt-4">
        <div className="card-header">
          <h3 className="card-title  ">Add New Branch</h3>
        </div>
        <form onSubmit={formik.handleSubmit}>
          <div className="grid p-6 grid-cols-2 gap-4">
            <div className="col-span-1">
              <label className="form-label ">Branch Name in English</label>
              <input
                className="input"
                value={formik.values.name}
                onChange={(e) => formik.setFieldValue("name", e.target.value)}
                onBlur={() => formik.setFieldTouched("name", true)}
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
                value={formik.values.name_ar}
                onChange={(e) =>
                  formik.setFieldValue("name_ar", e.target.value)
                }
                onBlur={() => formik.setFieldTouched("name_ar", true)}
              />
              {formik.touched.name_ar && formik.errors.name_ar && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.name_ar}
                </p>
              )}
            </div>

            <div>
              <label className="form-label mb-1">Phone Number</label>
              <MuiPhoneInput
                value={formik.values.phone}
                onBlur={() => formik.setFieldTouched("phone", true)}
                defaultCountry="EG"
                forceCallingCode
                onChange={(value, info) => {
                  // Remove the leading '+' and country code safely
                  const cleaned = value.replace(/[^0-9]/g, ""); // Remove all non-digits
                  const cc = info?.countryCallingCode || "20"; // fallback to Egypt
                  const mobile = cleaned.startsWith(cc)
                    ? cleaned.slice(cc.length)
                    : cleaned;

                  formik.setFieldValue("phone", mobile); // e.g. 1150595619
                }}
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
                // value={statusOptions.find(opt => opt.value === +formik.values.status)}
                onChange={(selected) => {
                  formik.setFieldValue("status", selected.value);
                }}
                placeholder="Select Status"
                styles={customStyles}
                onBlur={() => formik.setFieldTouched("status", true)}
              />
              {formik.touched.status && formik.errors.status && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.status}
                </p>
              )}
            </div>

            <div>
              <CitySelect formik={formik} />
            </div>

            <div>
              <ZoneSelect formik={formik} />
            </div>

            <div className="col-span-2">
              <label className="form-label">Enter Address in English</label>
              <input
                className="input"
                value={formik.values.address}
                onChange={(e) =>
                  formik.setFieldValue("address", e.target.value)
                }
                onBlur={() => formik.setFieldTouched("address", true)}
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
                onBlur={() => formik.setFieldTouched("address_ar", true)}
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
                onBlur={() => formik.setFieldTouched("latitude", true)}
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
                onBlur={() => formik.setFieldTouched("longitude", true)}
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
                  onChange={(e) =>
                    formik.setFieldValue(
                      "main_branch",
                      e.target.checked ? 1 : 0
                    )
                  }
                  onBlur={() => formik.setFieldTouched("main_branch", true)}
                />
              </label>
            </div>

            <div className="col-span-2">
              <MapContainer
                center={[
                  formik.values.latitude
                    ? parseFloat(formik.values.latitude)
                    : 28.5,
                  formik.values.longitude
                    ? parseFloat(formik.values.longitude)
                    : 34.5,
                ]}
                zoom={13}
                scrollWheelZoom={true}
                className="rounded-xl col-span-2 w-full h-60"
              >
                <TileLayer
                  attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationSelector
                  setLatLng={({ latitude, longitude }) => {
                    formik.setFieldValue("latitude", latitude);
                    formik.setFieldValue("longitude", longitude);
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
                  <div className="flex items-center justify-center gap-2">
                    <span className="loading loading-ring loading-md"></span>
                    Saving...
                  </div>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

BrancheDefaultContent.propTypes = {
  provider: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
};

export { BrancheDefaultContent };
