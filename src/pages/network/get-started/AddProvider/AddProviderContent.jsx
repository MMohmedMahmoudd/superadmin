import { useState } from "react";
import axios from "axios";
import clsx from "clsx";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import MuiPhoneInput from "./MuiPhoneInput";
import { CrudAvatarUpload } from "./CrudAvatarUpload";
import Svgify from "@sumcode/svgify";

const AddProviderContent = () => {
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const formik = useFormik({
    initialValues: {
      // Step 1
      person_image: "",
      person_status: "",
      person_name: "",
      person_email: "",
      person_password: "",
      person_mobile: "",
      country_code: "",
    },
    validationSchema: Yup.object({
      // Step 1
      person_name: Yup.string().required("Name is required"),
      person_email: Yup.string()
        .email("Invalid email")
        .required("Email is required"),
      person_password: Yup.string().min(6).required("Password is required"),
      person_mobile: Yup.string()
        .required("Mobile number is required")
        .matches(/^\d+$/, "Must be numeric only"), // ensures it's numbers only
      country_code: Yup.string()
        .required("Country code is required")
        .max(5, "Too long"), // allows codes like '+966', '+1234'
      person_status: Yup.string().required("Status is required"),
    }),
    onSubmit: (values) => {
      console.log("Form submitted:", values);
      // your submission logic here
    },
  });

  // Build the value expected by `mui-tel-input` (full phone number with country code)
  const phoneInputValue =
    formik.values.country_code && formik.values.person_mobile
      ? `${formik.values.country_code}${formik.values.person_mobile}`
      : formik.values.country_code || formik.values.person_mobile || "";

  const handleFileChange = (file) => {
    formik.setFieldValue("person_image", file);
  };

  const togglePassword = (event) => {
    event.preventDefault();
    setShowPassword(!showPassword);
  };

  const handleSubmit = async () => {
    try {
      // Run validation first
      const errors = await formik.validateForm();

      if (Object.keys(errors).length > 0) {
        formik.setTouched(
          Object.keys(errors).reduce((acc, key) => {
            acc[key] = true;
            return acc;
          }, {}),
          true
        );
        enqueueSnackbar("Please complete all required fields.", {
          variant: "error",
        });
        return;
      }

      setLoading(true);

      const data = new FormData();
      Object.entries(formik.values).forEach(([key, val]) => {
        data.append(key, val);
      });

      // Set user type - providers
      data.append("is_customer", "0");
      data.append("is_provider", "1");

      const token = JSON.parse(
        localStorage.getItem(
          import.meta.env.VITE_APP_NAME +
            "-auth-v" +
            import.meta.env.VITE_APP_VERSION
        )
      )?.access_token;

      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/user/create`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Check if the API response indicates success or failure
      if (response.data.success === false) {
        // Handle validation errors
        enqueueSnackbar(response.data.message, { variant: "error" });
        setErrors(response.data.data);
        return;
      }

      // Success case
      console.log("✅ Provider Created:", response.data);
      enqueueSnackbar("Provider created successfully!", { variant: "success" });
      navigate("/Providers");
    } catch (error) {
      console.error("❌ Submission failed:", error);

      // Clear any previous errors
      setErrors({});

      // Fix: The API returns errors in the 'data' field, not 'errors' field
      const responseErrors = error?.response?.data?.data || {};
      setErrors(responseErrors); // field-level fallback

      const errorMessage =
        error?.response?.data?.message ||
        Object.values(responseErrors)[0]?.[0] ||
        "Something went wrong. Please try again.";

      enqueueSnackbar(errorMessage, { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="w-full" onSubmit={formik.handleSubmit}>
      {/* Stepper Body */}
      <div className="card-body p-1">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="parent-cruds xl:col-span-1 col-span-3 card p-6">
            <div className="mb-5">
              <label
                className={[
                  "aspect-[16/9] max-h-60 w-full border-dashed border-2 border-gray-300 rounded-lg flex flex-col justify-center items-center p-4 gap-2",
                  "hover:border-primary hover:bg-[#FF6F1E11] cursor-pointer",
                ]}
              >
                {formik.values?.person_image ? (
                  <img
                    src={URL.createObjectURL(formik.values?.person_image)}
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
              {errors.person_image && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.person_image}
                </p>
              )}
            </div>

            <div className="card px-3 py-3">
              <label className="form-label mb-1">Status</label>
              <select
                className="select"
                {...formik.getFieldProps("person_status")}
              >
                <option value="">Select status</option>
                <option value="1">Active</option>
                <option value="2">Inactive</option>
                <option value="0">Blocked</option>
              </select>
              {formik.touched.person_status && formik.errors.person_status && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {formik.errors.person_status}
                </span>
              )}
              {/* Show server-side validation errors */}
              {errors.person_status && (
                <span role="alert" className="text-danger text-xs mt-1">
                  {errors.person_status[0]}
                </span>
              )}
            </div>
          </div>

          {/* Basic Information Card */}
          <div className="col-span-3 xl:col-span-2 card p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Provider Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label mb-1">Name</label>
                <input
                  className="input"
                  {...formik.getFieldProps("person_name")}
                />
                {formik.touched.person_name && formik.errors.person_name && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.person_name}
                  </p>
                )}
                {/* Show server-side validation errors */}
                {errors.person_name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.person_name[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label mb-1">Email</label>
                <input
                  className="input"
                  {...formik.getFieldProps("person_email")}
                />
                {formik.touched.person_email && formik.errors.person_email && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.person_email}
                  </p>
                )}
                {/* Show server-side validation errors */}
                {errors.person_email && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.person_email[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label mb-1">Mobile Number</label>
                <MuiPhoneInput
                  value={phoneInputValue}
                  defaultCountry="EG"
                  forceCallingCode
                  onChange={(value, info) => {
                    // Remove the leading '+' and country code safely
                    const cleaned = value.replace(/[^0-9]/g, ""); // Remove all non-digits
                    const cc = info?.countryCallingCode || "20"; // fallback to Egypt
                    const mobile = cleaned.startsWith(cc)
                      ? cleaned.slice(cc.length)
                      : cleaned;

                    formik.setFieldValue("person_mobile", mobile); // e.g. 1150595619
                    formik.setFieldValue("country_code", `+${cc}`); // e.g. +20
                  }}
                />
                {formik.touched.person_mobile &&
                  formik.errors.person_mobile && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.person_mobile}
                    </p>
                  )}
                {/* Show server-side validation errors */}
                {errors.person_mobile && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.person_mobile[0]}
                  </p>
                )}
              </div>

              <div>
                <label className="form-label mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    autoComplete="off"
                    {...formik.getFieldProps("person_password")}
                    className={clsx("input w-full pr-10", {
                      "border-red-500":
                        formik.touched.person_password &&
                        formik.errors.person_password,
                    })}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={togglePassword}
                    tabIndex={-1}
                  >
                    <i
                      className={clsx("ki-filled ki-eye", {
                        hidden: showPassword,
                      })}
                    ></i>
                    <i
                      className={clsx("ki-filled ki-eye-slash", {
                        hidden: !showPassword,
                      })}
                    ></i>
                  </button>
                </div>
                {formik.touched.person_password &&
                  formik.errors.person_password && (
                    <span role="alert" className="text-danger text-xs mt-1">
                      {formik.errors.person_password}
                    </span>
                  )}
                {/* Show server-side validation errors */}
                {errors.person_password && (
                  <span role="alert" className="text-danger text-xs mt-1">
                    {errors.person_password[0]}
                  </span>
                )}
              </div>

              <div className="col-span-2">
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    className="btn bg-gradient-primary -translate-x-2 hover:translate-x-0 outline-0 border-0 text-white"
                    disabled={loading}
                    onClick={() => {
                      formik.validateForm().then((errors) => {
                        if (Object.keys(errors).length === 0) {
                          handleSubmit(); // If valid
                        } else {
                          enqueueSnackbar(
                            "Please complete all required fields.",
                            { variant: "error" }
                          );

                          // Touch all fields to show errors
                          Object.keys(errors).forEach((key) => {
                            formik.setFieldTouched(key, true);
                          });
                        }
                      });
                    }}
                  >
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export { AddProviderContent };
