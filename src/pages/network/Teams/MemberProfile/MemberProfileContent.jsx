import { useFormik } from "formik";
import * as Yup from "yup";
import clsx from "clsx";
import { Tabs, Tab, TabsList, TabPanel } from "@/components/tabs";
import { useState } from "react";
import MuiPhoneInput from "../../Bussiness/AddBussiness/MuiPhoneInput";
import PropTypes from "prop-types";
import { useSnackbar } from "notistack";
import { Link } from "react-router-dom";
import axios from "axios";
import { useEffect } from "react";
import { forwardRef } from "react";
import RoleSelect from "../AddMember/RoleSelect";

const MemberProfileContent = forwardRef(
  ({ memberId, member, profileImage, setFormikMeta }) => {
    // everything inside your component logic here
    const [activeTab, setActiveTab] = useState("Information");
    const [showPassword, setShowPassword] = useState(false);
    const [responseData, setResponseData] = useState(null);
    const [memberData, setMemberData] = useState(member);
    const { enqueueSnackbar } = useSnackbar();

    const togglePassword = (event) => {
      event.preventDefault();
      setShowPassword(!showPassword);
    };
    const formik = useFormik({
      initialValues: {
        person_name: memberData?.person?.person_name || "",
        person_email: memberData?.person?.person_email || "",
        person_password: "",
        person_image: profileImage || memberData?.person?.person_image || null,
        country_code: memberData?.person?.country_code?.toString() || "",
        person_mobile: memberData?.person?.person_mobile || "",
        person_status: memberData?.person?.person_status?.toString() || "1",
        group_uid: memberData?.group?.group_uid?.toString() || "",
        is_customer: "0",
        is_provider: "0",
      },
      enableReinitialize: true,
      validationSchema: Yup.object({
        person_name: Yup.string().required("Name is required"),
        person_email: Yup.string().email().required("Email is required"),
        person_mobile: Yup.string().required("Phone is required"),
        country_code: Yup.string().required(),
        person_status: Yup.string().required(),
        group_uid: Yup.string().required("Role is required"),
        person_password: Yup.string().min(
          6,
          "Password must be at least 6 characters"
        ),
        person_image: Yup.mixed()
          .test(
            "is-file-or-existing",
            "Profile image is required",
            function (value) {
              if (typeof value === "string" && value !== "") return true; // existing image ✅
              if (value instanceof File) return true; // uploaded file ✅
              return false; // ❌ nothing provided
            }
          )
          .test(
            "fileFormat",
            "Unsupported file format. Only jpeg, png, jpg, gif, svg are allowed.",
            (value) => {
              if (!value || typeof value === "string") return true;
              return [
                "image/jpeg",
                "image/png",
                "image/jpg",
                "image/gif",
                "image/svg+xml",
              ].includes(value.type);
            }
          ),
      }),
      onSubmit: async (values, { setSubmitting }) => {
        try {
          // Touch all fields to show errors visually
          await formik.setTouched({
            person_name: true,
            person_email: true,
            person_mobile: true,
            country_code: true,
            person_status: true,
            person_image: true,
          });

          const errors = await formik.validateForm();
          formik.setTouched(
            {
              ...formik.touched,
              person_image: true,
            },
            true
          );

          // Force update visible errors
          setFormikMeta({
            errors: formik.errors,
            touched: formik.touched,
          });

          if (Object.keys(errors).length > 0) {
            enqueueSnackbar("Please fix the errors before submitting.", {
              variant: "error",
            });
            return;
          }

          setSubmitting(true);

          const token = JSON.parse(
            localStorage.getItem(
              import.meta.env.VITE_APP_NAME +
                "-auth-v" +
                import.meta.env.VITE_APP_VERSION
            )
          )?.access_token;

          const formData = new FormData();
          const statusMap = {
            active: 1,
            inactive: 2,
            blocked: 0,
          };

          Object.entries(values).forEach(([key, val]) => {
            if (key === "person_image") {
              if (val && typeof val !== "string") {
                formData.append("person_image", val); // ✅ only send File
              }
              // else: do not append anything if it's a string (existing image)
              return;
            } else if (key === "person_status") {
              formData.append(
                "person_status",
                statusMap[val.toLowerCase()] ?? 1
              );
            } else if (key === "person_password") {
              // Only send password if it's provided
              if (val && val.trim() !== "") {
                formData.append(key, val);
              }
            } else if (key === "is_customer" || key === "is_provider") {
              formData.append(key, val);
            } else {
              formData.append(key, val);
            }
          });

          formData.append("_method", "PUT");

          const response = await axios.post(
            `${import.meta.env.VITE_APP_API_URL}/team/${memberId}/update`,
            formData,
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
              },
            }
          );
          console.log("response", response);

          // Store response data in state
          console.log("Full response:", response);
          console.log("Response data:", response.data);
          console.log("Response data structure:", {
            success: response.data.success,
            message: response.data.message,
            data: response.data.data,
            hasData: !!response.data.data,
            dataKeys: response.data.data ? Object.keys(response.data.data) : [],
          });
          setResponseData(response.data);
        } catch (error) {
          console.error("❌ Update failed:", error);
          const responseData = error?.response?.data;
          let errorMessage = "Something went wrong. Please try again.";
          let fieldErrors = {};

          if (responseData) {
            if (responseData.data && typeof responseData.data === "object") {
              fieldErrors = responseData.data;
              console.log("Field errors from API:", fieldErrors);

              // Display each field error and set formik errors
              Object.entries(fieldErrors).forEach(([field, messages]) => {
                if (Array.isArray(messages) && messages.length > 0) {
                  console.log(`Setting error for field ${field}:`, messages[0]);
                  formik.setFieldError(field, messages[0]);
                  formik.setFieldTouched(field, true);
                }
              });

              // Show a general error message if there are field errors
              if (Object.keys(fieldErrors).length > 0) {
                enqueueSnackbar("Please fix the validation errors below.", {
                  variant: "error",
                });
              }
            }
            errorMessage = responseData.message || errorMessage;
          }

          // Only show the general error message if there are no field-specific errors
          if (Object.keys(fieldErrors).length === 0) {
            enqueueSnackbar(errorMessage, { variant: "error" });
          }
        } finally {
          setSubmitting(false);
        }
      },
    });

    // Debug: check group_uid and options
    // Remove after confirming it works
    console.log("formik.values.group_uid:", formik.values.group_uid);

    useEffect(() => {
      // Set the field with either uploaded image, or existing image, or null
      formik.setFieldValue(
        "person_image",
        profileImage || memberData?.person?.person_image || null
      );

      // Show snackbar error if nothing exists AND user tried to submit
      if (
        !profileImage &&
        !memberData?.person?.person_image &&
        formik.submitCount > 0
      ) {
        enqueueSnackbar("Profile image is required", { variant: "error" });
      }
    }, [profileImage, memberData?.person?.person_image, formik.submitCount]);

    // Handle response data changes
    useEffect(() => {
      console.log("useEffect triggered with responseData:", responseData);
      if (responseData) {
        console.log("Response data changed:", responseData);
        console.log("Response data structure in useEffect:", {
          success: responseData.success,
          message: responseData.message,
          data: responseData.data,
          hasData: !!responseData.data,
          dataKeys: responseData.data ? Object.keys(responseData.data) : [],
          dataType: typeof responseData.data,
        });

        // Check if there are validation errors
        if (responseData.success === false) {
          // Based on Postman response structure: { success: false, message: "...", data: { field: [errors] } }
          const fieldErrors = responseData.data || {};
          console.log("Field errors from API:", fieldErrors);

          // Set formik errors for each field
          Object.entries(fieldErrors).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              console.log(`Setting error for field ${field}:`, messages[0]);
              formik.setFieldError(field, messages[0]);
              formik.setFieldTouched(field, true);
            }
          });

          // Show error message immediately
          enqueueSnackbar("Please fix the validation errors below.", {
            variant: "error",
            autoHideDuration: 4000,
            anchorOrigin: {
              vertical: "top",
              horizontal: "right",
            },
          });

          // Also show individual field error messages
          Object.entries(fieldErrors).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              enqueueSnackbar(`${field}: ${messages[0]}`, {
                variant: "error",
                autoHideDuration: 6000,
                anchorOrigin: {
                  vertical: "top",
                  horizontal: "right",
                },
              });
            }
          });
        } else if (responseData.success === true) {
          // Success case - update member data with response
          if (responseData.member) {
            setMemberData(responseData.member);
          }
          enqueueSnackbar("Member updated successfully!", {
            variant: "success",
            autoHideDuration: 3000,
            anchorOrigin: {
              vertical: "top",
              horizontal: "right",
            },
          });
        }

        // Clear response data after handling
        setResponseData(null);
      }
    }, [responseData, formik, enqueueSnackbar]);

    useEffect(() => {
      if (!memberData?.providers && activeTab === "Business") {
        setActiveTab("Information");
      }
    }, [memberData, activeTab]);

    // Callback to receive roles from RoleSelect
    const handleRolesLoaded = () => {
      // Role loading handled by RoleSelect component
    };

    // Return null if required props are not available
    if (!memberId || !memberData) {
      return null;
    }

    return (
      <>
        <div className="mt-1">
          <Tabs
            value={activeTab}
            onChange={(_, newValue) => setActiveTab(newValue)}
          >
            <TabsList className="flex flex-wrap">
              <Tab value="Information">Information</Tab>
              {memberData?.providers?.length > 0 && (
                <Tab value="Business">Business</Tab>
              )}
              {/* <Tab value="Payments">Payments</Tab> */}
            </TabsList>
            <TabPanel value="Information">
              <div className="grid grid-cols-1 mt-5 xl:grid-cols-1 gap-5 lg:gap-7.5">
                {/* Statistics Section */}

                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Basic Information
                  </h3>
                  <form onSubmit={formik.handleSubmit}>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="form-label mb-1"> Name</label>
                        <input
                          className="input"
                          name="person_name"
                          value={formik.values.person_name}
                          {...formik.getFieldProps("person_name")}
                        />
                        {formik.touched.person_name &&
                          formik.errors.person_name && (
                            <p className="text-red-500 text-xs mt-1">
                              {formik.errors.person_name}
                            </p>
                          )}
                      </div>
                      <div>
                        <label className="form-label mb-1"> Email</label>
                        <input
                          className="input"
                          {...formik.getFieldProps("person_email")}
                        />
                        {formik.touched.person_email &&
                          formik.errors.person_email && (
                            <p className="text-red-500 text-xs mt-1">
                              {formik.errors.person_email}
                            </p>
                          )}
                      </div>
                      <div>
                        <label className="form-label mb-1"> Phone Number</label>
                        <MuiPhoneInput
                          value={formik.values.person_mobile}
                          onChange={(value, country) => {
                            formik.setFieldValue("person_mobile", value);
                            formik.setFieldValue(
                              "country_code",
                              "+" + country?.dialCode
                            );
                          }}
                          defaultCountry="EG"
                          className="input"
                        />
                        {formik.touched.person_mobile &&
                          formik.errors.person_mobile && (
                            <p className="text-red-500 text-xs mt-1">
                              {formik.errors.person_mobile}
                            </p>
                          )}
                      </div>
                      <div className="flex flex-col gap-1 w-full">
                        <div className="flex items-center justify-between">
                          <label className="form-label mb-1">Password</label>
                        </div>
                        <label className="input w-full relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            autoComplete="off"
                            {...formik.getFieldProps("person_password")}
                            className={clsx("form-control w-full", {
                              "is-invalid":
                                formik.touched.person_password &&
                                formik.errors.person_password,
                            })}
                          />
                          <button
                            type="button"
                            className="btn btn-icon absolute right-2 top-1/2 -translate-y-1/2"
                            onClick={togglePassword}
                            tabIndex={-1}
                          >
                            <i
                              className={clsx(
                                "ki-filled ki-eye text-gray-500",
                                { hidden: showPassword }
                              )}
                            ></i>
                            <i
                              className={clsx(
                                "ki-filled ki-eye-slash text-gray-500",
                                { hidden: !showPassword }
                              )}
                            ></i>
                          </button>
                        </label>

                        {formik.touched.person_password &&
                          formik.errors.person_password && (
                            <span
                              role="alert"
                              className="text-danger text-xs mt-1"
                            >
                              {formik.errors.person_password}
                            </span>
                          )}
                      </div>
                      <div className="flex flex-col gap-1 w-full">
                        <RoleSelect
                          formik={formik}
                          onRolesLoaded={handleRolesLoaded}
                          group_uid={formik.values.group_uid}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end items-center">
                      <button
                        type="submit"
                        disabled={formik.isSubmitting}
                        className="btn btn-primary mt-4"
                      >
                        {formik.isSubmitting ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </TabPanel>
            {memberData?.providers?.length > 0 && (
              <TabPanel value="Business">
                <div className="grid grid-cols-1 mt-5 xl:grid-cols-1 gap-5 lg:gap-7.5">
                  <div className="card">
                    <div className="card-header">
                      <h3 className="card-title">Business</h3>
                      <div className="card-toolbar">
                        <button className="btn btn-primary">
                          Add New Business
                        </button>
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="grid grid-cols-2 gap-4">
                        {memberData.providers.map((business) => (
                          <div key={business.id} className="card">
                            <div className="card-header">
                              <img
                                src={
                                  business.image || "/media/avatars/blank.png"
                                }
                                className="w-10 h-10 rounded-full"
                                alt=""
                                onError={(e) => {
                                  e.target.src = "/media/avatars/blank.png";
                                }}
                              />
                              <div className="card-toolbar">
                                <span
                                  className={clsx("badge", {
                                    "badge-success":
                                      business.status === "active",
                                    "badge-danger":
                                      business.status === "inactive",
                                    "badge-warning":
                                      business.status ===
                                      "waiting confirmation",
                                    "badge-outline": true,
                                    capitalize: true,
                                  })}
                                >
                                  {business.status}
                                </span>
                              </div>
                            </div>
                            <div className="card-body flex flex-col gap-y-8">
                              <div className="parent">
                                <Link
                                  to={`/businessprofile/${business.id}`}
                                  className="card-title hover:text-primary"
                                >
                                  {business.name}
                                </Link>
                                <p className="card-title text-sm">
                                  {business.type?.name}
                                </p>
                              </div>
                              <p className="card-title flex gap-x-8 text-sm">
                                <span>
                                  Offers:{" "}
                                  {business.statistics?.offers_count || 0}
                                </span>
                                <span>
                                  Reservations:{" "}
                                  {business.statistics?.bookings_count || 0}
                                </span>
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabPanel>
            )}
          </Tabs>
        </div>
      </>
    );
  }
);

MemberProfileContent.propTypes = {
  memberId: PropTypes.string,
  member: PropTypes.shape({
    id: PropTypes.number,
    person: PropTypes.shape({
      person_uid: PropTypes.number,
      person_name: PropTypes.string,
      person_email: PropTypes.string,
      person_mobile: PropTypes.string,
      country_code: PropTypes.number,
      person_image: PropTypes.string,
      person_status: PropTypes.number,
      person_add_date: PropTypes.string,
    }),
    group: PropTypes.shape({
      group_uid: PropTypes.number,
      group_name: PropTypes.string,
    }),
    providers: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        image: PropTypes.string,
        status: PropTypes.string,
        type: PropTypes.shape({
          id: PropTypes.number,
          name: PropTypes.string,
        }),
        statistics: PropTypes.shape({
          offers_count: PropTypes.number,
          bookings_count: PropTypes.number,
        }),
      })
    ),
  }),
  profileImage: PropTypes.string,
  setFormikMeta: PropTypes.func.isRequired,
};

MemberProfileContent.displayName = "MemberProfileContent";

export { MemberProfileContent };
