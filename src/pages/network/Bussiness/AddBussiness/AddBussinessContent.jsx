import { useEffect, useState } from "react";
import axios from "axios";
import clsx from "clsx";
import { MapContainer, TileLayer } from "react-leaflet";
import { LocationSelector } from "./LocationSelector";
import "leaflet/dist/leaflet.css";
import { useSnackbar } from "notistack";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import MuiPhoneInput from "./MuiPhoneInput";
import { CrudAvatarUpload } from "./CrudAvatarUpload";
import { RecentUploads } from "./RecentUploads";
import { PersonNameSelect } from "./PersonNameSelect";
import { BusinessTypeSelect } from "./BusinessTypeSelect";
import { CitySelect } from "./CitySelect";
import { customSelectStyles, ZoneSelect } from "./ZoneSelect";
import Select from "react-select";
import Svgify from "@sumcode/svgify";

const AddBussinessContent = () => {
  const [searchParams] = useSearchParams();
  const providerId = searchParams.get("provider");
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const formik = useFormik({
    initialValues: {
      // Step 1
      sp_status: "",
      person_uid: "",
      sp_name_english: "",
      sp_name_arabic: "",
      branch_name_english: "",
      branch_name_arabic: "",
      sp_description_english: "",
      sp_description_arabic: "",
      sp_type_uid: "",
      branch_email: "",
      branch_phone: "",
      city_uid: "",
      zone_uid: "",
      branch_address_english: "",
      branch_address_arabic: "",
      branch_latitude: "",
      branch_longitude: "",

      // Add other fields here...
    },
    validationSchema: Yup.object({
      // Step 1

      person_uid: Yup.string().required("Name is required"),
      branch_email: Yup.string()
        .email("Invalid email")
        .required("Email is required"),
      branch_phone: Yup.string()
        .required("Mobile number is required")
        .matches(/^\d+$/, "Must be numeric only"), // ensures it's numbers only

      sp_name_english: Yup.string().required(
        "Business name in English is required"
      ),
      sp_name_arabic: Yup.string().required(
        "Business name in Arabic is required"
      ),
      sp_description_english: Yup.string().required(
        "Business description in English is required"
      ),
      sp_description_arabic: Yup.string().required(
        "Business description in Arabic is required"
      ),
      sp_type_uid: Yup.string().required("Business type is required"),

      // Step 2
      city_uid: Yup.string().required(),
      zone_uid: Yup.string().required(),
      branch_name_english: Yup.string().required(),
      branch_name_arabic: Yup.string().required(),
      branch_address_english: Yup.string().required(),
      branch_address_arabic: Yup.string().required(),
      branch_latitude: Yup.mixed().required("Latitude is required"),
      branch_longitude: Yup.mixed().required("Longitude is required"),
      sp_status: Yup.string().required("sp_status is required"),
      sp_image: Yup.mixed().required("Provider logo is required"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);

        const data = new FormData();
        Object.entries(values).forEach(([key, val]) => {
          if (Array.isArray(val)) {
            if (val.length > 0) {
              val.forEach((file) => {
                data.append(`${key}[]`, file);
              });
            } else {
              // Still append empty field for arrays
              data.append(`${key}[]`, "");
            }
          } else {
            data.append(key, val);
          }
        });

        const token = JSON.parse(
          localStorage.getItem(
            import.meta.env.VITE_APP_NAME +
              "-auth-v" +
              import.meta.env.VITE_APP_VERSION
          )
        )?.access_token;

        await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/providers/create`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        enqueueSnackbar("Provider created successfully!", {
          variant: "success",
        });
        navigate("/bussiness");
      } catch (error) {
        console.error("❌ Submission failed:", error);
        const responseErrors = error?.response?.data?.errors || {};
        setErrors(responseErrors);

        const errorMessage =
          error?.response?.data?.message ||
          Object.values(responseErrors)[0]?.[0] ||
          "Something went wrong. Please try again.";

        enqueueSnackbar(errorMessage, { variant: "error" });
      } finally {
        setLoading(false);
      }
    },
  });

  const handleFileChange = (file) => {
    console.log("Selected file:", file);
    formik.setFieldValue("sp_image", file);
  };

  // Build the value expected by `mui-tel-input` (full phone number with country code)
  const phoneInputValue =
    formik.values.country_code && formik.values.branch_phone
      ? `+${formik.values.country_code}${formik.values.branch_phone}`
      : formik.values.country_code
        ? `+${formik.values.country_code}`
        : formik.values.branch_phone || "";

  return (
    <form className="w-full" onSubmit={formik.handleSubmit}>
      {/* Dashed Line Separator Between Steps */}

      {/* Stepper Body */}
      <div className="card-body p-1 ">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="parent-cruds xl:col-span-1  col-span-3 card p-6">
            {/* <div className=" flex justify-center items-center dark:bg-gray-200 bg-gray-100 rounded-lg py-4 flex-col gap-y-4 mb-4">
              <label className="block text-sm font-medium mb-1">
                Provider Logo{" "}
              </label>
              <CrudAvatarUpload onFileChange={handleFileChange} />
              {errors.sp_image && (
                <p className="text-red-500 text-sm mt-1">{errors.sp_image}</p>
              )}

              <p className="text-sm text-center text-gray-500 mt-1">
                Only *.png, *.jpg, and *.jpeg image files are accepted.
              </p>
            </div> */}

            <div>
              <label
                className={[
                  "aspect-[16/9] max-h-60 w-full border-dashed border-2 border-gray-300 rounded-lg flex flex-col justify-center items-center p-4 gap-2",
                  "hover:border-primary hover:bg-[#FF6F1E11] cursor-pointer",
                ]}
              >
                {formik.values?.sp_image ? (
                  <img
                    src={URL.createObjectURL(formik.values?.sp_image)}
                    alt="provider logo"
                  />
                ) : (
                  <>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileChange(e.target.files[0])}
                      accept=".png, .jpg, .jpeg"
                    />
                    <Svgify
                      IconName="image"
                      FontWeight="stroke"
                      Scale={2}
                      className="text-[#FF6F1E]"
                    />
                    <p className="font-bold text-center">
                      Click or Drag & Drop
                    </p>
                    <p className="text-gray-500 text-center">
                      SVG,PNG, JPG (max. 800x400)
                    </p>
                  </>
                )}
              </label>

              {errors.sp_image && (
                <p className="text-red-500 text-sm mt-1">{errors.sp_image}</p>
              )}
            </div>

            <div className=" card p-6 mt-5">
              <label className="form-label mb-1">Status</label>
              <Select
                classNamePrefix="react-select"
                options={[
                  {
                    value: "1",
                    label: "Active",
                  },
                  {
                    value: "0",
                    label: "Inactive",
                  },
                ]}
                value={
                  [
                    {
                      value: "1",
                      label: "Active",
                    },
                    {
                      value: "0",
                      label: "Inactive",
                    },
                  ].find((opt) => opt.value == formik.values.sp_status) || null
                }
                onChange={(newValue) => {
                  formik.setFieldValue(
                    "sp_status",
                    newValue ? newValue.value : ""
                  );
                }}
                styles={customSelectStyles}
              ></Select>
              {formik.touched.sp_status && formik.errors.sp_status && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {formik.errors.sp_status}
                </span>
              )}
            </div>
            <div className="  mt-5 card">
              <RecentUploads
                title="Documents"
                setFieldValue={formik.setFieldValue}
              />
            </div>
          </div>

          {/* Basic Information Card */}
          <div className="col-span-3 xl:col-span-2 card p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Business Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <PersonNameSelect formik={formik} providerId={providerId} />
              </div>

              <div className="col-span-1">
                <BusinessTypeSelect formik={formik} />
              </div>

              <div className="col-span-2">
                <label className="form-label mb-1">
                  Business Name In English
                </label>
                <input
                  className="input"
                  {...formik.getFieldProps("sp_name_english")}
                />
                {formik.touched.sp_name_english &&
                  formik.errors.sp_name_english && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.sp_name_english}
                    </p>
                  )}
              </div>
              <div className="col-span-2">
                <label className="form-label mb-1">
                  Business Name In Arabic
                </label>
                <input
                  className="input"
                  {...formik.getFieldProps("sp_name_arabic")}
                />
                {formik.touched.sp_name_arabic &&
                  formik.errors.sp_name_arabic && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.sp_name_arabic}
                    </p>
                  )}
              </div>
              <div className="col-span-2">
                <label className="form-label mb-1">
                  Business Description In English
                </label>
                <textarea
                  className="textarea"
                  {...formik.getFieldProps("sp_description_english")}
                />
                {formik.touched.sp_description_english &&
                  formik.errors.sp_description_english && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.sp_description_english}
                    </p>
                  )}
              </div>
              <div className="col-span-2">
                <label className="form-label mb-1">
                  Business Description In Arabic
                </label>
                <textarea
                  className="textarea"
                  {...formik.getFieldProps("sp_description_arabic")}
                />
                {formik.touched.sp_description_arabic &&
                  formik.errors.sp_description_arabic && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.sp_description_arabic}
                    </p>
                  )}
              </div>
            </div>
          </div>
          {/* Business Information Card */}
        </div>

        <div className=" col-span-3 card p-6 mt-5">
          <div className="grid col-span-3 xl:col-span-2 gap-4">
            <div className="col-span-2">
              <h3 className="text-lg font-semibold mb-4 text-gray-900">
                Main Branch Information
              </h3>
            </div>
            <div className="col-span-1">
              <label className="form-label mb-1">Branch Name (English)</label>
              <input
                className={clsx("input", {
                  "is-invalid":
                    formik.touched.branch_name_english &&
                    formik.errors.branch_name_english,
                })}
                {...formik.getFieldProps("branch_name_english")}
              />
              {formik.touched.branch_name_english &&
                formik.errors.branch_name_english && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.branch_name_english}
                  </p>
                )}
            </div>
            <div className="col-span-1">
              <label className="form-label mb-1">Branch Name (Arabic)</label>
              <input
                className={clsx("input", {
                  "is-invalid":
                    formik.touched.branch_name_arabic &&
                    formik.errors.branch_name_arabic,
                })}
                {...formik.getFieldProps("branch_name_arabic")}
              />
              {formik.touched.branch_name_arabic &&
                formik.errors.branch_name_arabic && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.branch_name_arabic}
                  </p>
                )}
            </div>
            <div>
              <label className="form-label mb-1">Branch Email</label>
              <input
                className="input"
                {...formik.getFieldProps("branch_email")}
              />
              {formik.touched.branch_email && formik.errors.branch_email && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.branch_email}
                </p>
              )}
            </div>
            <div>
              <label className="form-label mb-1"> Phone Number</label>
              <MuiPhoneInput
                value={phoneInputValue}
                onChange={(value, info) => {
                  // Extract mobile number without country code
                  const cleaned = value.replace(/[^0-9]/g, ""); // Remove all non-digits
                  const cc =
                    info?.countryCallingCode ||
                    formik.values.country_code ||
                    "20"; // fallback to Egypt
                  const mobile = cleaned.startsWith(cc)
                    ? cleaned.slice(cc.length)
                    : cleaned;
                  formik.setFieldValue("branch_phone", mobile); // local part only
                  formik.setFieldValue("country_code", cc); // without +
                }}
              />
              {formik.touched.branch_phone && formik.errors.branch_phone && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.branch_phone}
                </p>
              )}
              {formik.touched.country_code && formik.errors.country_code && (
                <p className="text-red-500 text-xs mt-1">
                  {formik.errors.country_code}
                </p>
              )}
            </div>

            <div>
              <CitySelect formik={formik} />
            </div>
            <div>
              <ZoneSelect formik={formik} />
            </div>
            <div>
              <label className="form-label mb-1">Address in English</label>
              <input
                className={clsx("input", {
                  "is-invalid":
                    formik.touched.branch_address_english &&
                    formik.errors.branch_address_english,
                })}
                {...formik.getFieldProps("branch_address_english")}
              />
              {formik.touched.branch_address_english &&
                formik.errors.branch_address_english && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.branch_address_english}
                  </p>
                )}
            </div>
            <div>
              <label className="form-label mb-1">Address in Arabic</label>
              <input
                className={clsx("input", {
                  "is-invalid":
                    formik.touched.branch_address_arabic &&
                    formik.errors.branch_address_arabic,
                })}
                {...formik.getFieldProps("branch_address_arabic")}
              />
              {formik.touched.branch_address_arabic &&
                formik.errors.branch_address_arabic && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.branch_address_arabic}
                  </p>
                )}
            </div>
            <div>
              <label className="form-label mb-1">Latitude</label>
              <input
                className={clsx("input", {
                  "is-invalid":
                    formik.touched.branch_latitude &&
                    formik.errors.branch_latitude,
                })}
                {...formik.getFieldProps("branch_latitude")}
                readOnly
              />
              {formik.touched.branch_latitude &&
                formik.errors.branch_latitude && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.branch_latitude}
                  </p>
                )}
            </div>
            <div>
              <label className="form-label mb-1">Longitude</label>
              <input
                className={clsx("input", {
                  "is-invalid":
                    formik.touched.branch_longitude &&
                    formik.errors.branch_longitude,
                })}
                {...formik.getFieldProps("branch_longitude")}
                readOnly
              />
              {formik.touched.branch_longitude &&
                formik.errors.branch_longitude && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.branch_longitude}
                  </p>
                )}
            </div>

            <div className="col-span-2 relative z-0">
              <label className="form-label mb-1">Pick Location on Map</label>
              <MapContainer
                center={[28.5, 34.5]}
                zoom={13}
                scrollWheelZoom={true}
                className="rounded-xl col-span-2 w-full h-60"
              >
                <TileLayer
                  attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationSelector
                  setLatLng={({ branch_latitude, branch_longitude }) => {
                    formik.setFieldValue("branch_latitude", branch_latitude);
                    formik.setFieldValue("branch_longitude", branch_longitude);
                  }}
                />
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
      {/* Footer Buttons */}
      <div className="card-footer py-8 flex justify-end">
        <button
          type="button"
          className="btn btn-outline btn-primary"
          disabled={loading}
          onClick={() => {
            formik.validateForm().then((errors) => {
              if (Object.keys(errors).length === 0) {
                formik.handleSubmit();
              } else {
                console.log("❌ Form blocked due to errors:", errors);
                enqueueSnackbar("Please complete all required fields.", {
                  variant: "error",
                });

                // Touch fields to show errors
                Object.keys(errors).forEach((key) =>
                  formik.setFieldTouched(key, true)
                );
              }
            });
          }}
        >
          {loading ? "Saving..." : "Submit"}
        </button>
      </div>
    </form>
  );
};

export { AddBussinessContent };
