import { useState } from "react";
import axios from "axios";
import "leaflet/dist/leaflet.css";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { UsersSelect } from "./UsersSelect";
import { BusinessSelect } from "./BusinessSelect";
import { FlowbiteHtmlDatepicker } from "@/components";
import { OfferSelect } from "./OfferSelect";
import { BranchesSelect } from "./BranchesSelect";
import { toAbsoluteUrl } from "@/utils";

const AddReservationContent = () => {
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      person_uid: "",
      sp_uid: "",
      offer_uid: "",
      booking_status: "5", // Defaulting to 1 as seen in Postman
      booking_date: "",
      arrival_date: "",
      // qty: '',
      branch_uid: "",
      offerData: null,
      selectedOptions: [], // Array of { options_id, qty }
    },
    validationSchema: Yup.object({
      person_uid: Yup.string().required("Name is required"),
      sp_uid: Yup.string().required("Business is required"),
      offer_uid: Yup.string().required("Offer is required"),
      booking_date: Yup.string().required("Booking date is required"),
      // qty: Yup.string().required('Coupon quantity is required'),
      branch_uid: Yup.string().required("Branch is required"),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);

        // Validate selected options have valid quantities
        if (values.selectedOptions && values.selectedOptions.length > 0) {
          const invalidOptions = values.selectedOptions.filter(
            (opt) => !opt.qty || parseInt(opt.qty) < 1
          );
          if (invalidOptions.length > 0) {
            enqueueSnackbar(
              "Please enter a valid quantity for all selected options",
              { variant: "error" }
            );
            setLoading(false);
            return;
          }
        }

        const data = new FormData();

        // Append basic fields (excluding offerData and selectedOptions)
        Object.entries(values).forEach(([key, val]) => {
          if (key === "offerData" || key === "selectedOptions") return;
          // Handle multi-select for branches_id if needed, but API expects single branch_uid
          // For now, assuming branch_uid is a single value string/number
          data.append(key, val);
        });

        // Append booking_options if any options are selected
        if (values.selectedOptions && values.selectedOptions.length > 0) {
          values.selectedOptions.forEach((option, index) => {
            if (option.options_id && option.qty && parseInt(option.qty) > 0) {
              // API expects option_id
              data.append(
                `booking_options[${index}][option_id]`,
                option.options_id
              );
              data.append(`booking_options[${index}][qty]`, option.qty);
            }
          });
        }

        // New logic: default paid status is 2 (no paid) on creation
        data.append("paid", "2");

        const token = JSON.parse(
          localStorage.getItem(
            import.meta.env.VITE_APP_NAME +
              "-auth-v" +
              import.meta.env.VITE_APP_VERSION
          )
        )?.access_token;

        await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/reservation/create`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
              "Accept-Language": "en",
              lang: "en",
            },
          }
        );

        enqueueSnackbar("Reservation created successfully!", {
          variant: "success",
        });
        navigate("/reservations");
      } catch (error) {
        console.error("❌ Submission failed:", error);
        const responseErrors = error?.response?.data?.errors || {};

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

  return (
    <form className="w-full" onSubmit={formik.handleSubmit}>
      <div className="card-body p-1">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {/* Basic Information Card */}
          <div className="col-span-3 xl:col-span-2 card p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">
              Business Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <UsersSelect formik={formik} />
              </div>

              <div className="col-span-1">
                <label className="form-label mb-2">Business</label>
                <BusinessSelect formik={formik} />
                {formik.touched.sp_uid && formik.errors.sp_uid && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.sp_uid}
                  </p>
                )}
              </div>

              <div className="col-span-1">
                <label className="form-label mb-2">Offer</label>
                <OfferSelect formik={formik} />
                {formik.touched.offer_uid && formik.errors.offer_uid && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.offer_uid}
                  </p>
                )}
              </div>

              {/* Options Selection */}
              {formik.values.offerData?.options &&
                formik.values.offerData.options.length > 0 && (
                  <div className="col-span-2">
                    <label className="form-label mb-2">Select Options</label>
                    <div className="border rounded-lg p-4 space-y-3">
                      {formik.values.offerData.options.map((option) => {
                        const selectedOption =
                          formik.values.selectedOptions.find(
                            (opt) => opt.options_id === option.id.toString()
                          );
                        const isSelected = !!selectedOption;

                        return (
                          <label
                            key={option.id}
                            className={`flex items-center gap-4 p-3 border rounded-md cursor-pointer ${isSelected ? "bg-blue-800/10 border border-primary" : ""}`}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const subset =
                                  formik.values.selectedOptions.filter(
                                    (opt) =>
                                      opt.options_id !== option.id.toString()
                                  );
                                if (e.target.checked) {
                                  formik.setFieldValue("selectedOptions", [
                                    ...subset,
                                    {
                                      options_id: option.id.toString(),
                                      qty: "1",
                                    },
                                  ]);
                                } else {
                                  formik.setFieldValue(
                                    "selectedOptions",
                                    subset
                                  );
                                }
                              }}
                              className="hidden"
                            />
                            <div className="flex-1 flex items-center gap-4">
                              <img
                                src={
                                  option.images?.[0]?.image ||
                                  toAbsoluteUrl("/media/avatars/blank.png")
                                }
                                alt={option.name}
                                className="w-20 h-20 object-cover square rounded-sm"
                              />
                              <div>
                                <div className="font-semibold">
                                  {option.name}
                                </div>
                                {option.description && (
                                  <div className="text-sm text-gray-600">
                                    {option.description}
                                  </div>
                                )}
                                <div className="text-sm text-gray-500">
                                  Price: {option.price}{" "}
                                  {formik.values.offerData?.currency ||
                                    formik.values.offerData?.currency_name ||
                                    "EGP"}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Available: {option.qty}
                                </div>
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-32">
                                <input
                                  type="number"
                                  min="1"
                                  max={parseInt(option.qty) || 999}
                                  placeholder="Quantity"
                                  className="input input-sm w-full"
                                  value={selectedOption?.qty || ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    const updatedOptions =
                                      formik.values.selectedOptions.map(
                                        (opt) =>
                                          opt.options_id ===
                                          option.id.toString()
                                            ? { ...opt, qty: value }
                                            : opt
                                      );
                                    formik.setFieldValue(
                                      "selectedOptions",
                                      updatedOptions
                                    );
                                  }}
                                  onBlur={() => {
                                    // Ensure qty is at least 1 if option is selected
                                    const currentOption =
                                      formik.values.selectedOptions.find(
                                        (opt) =>
                                          opt.options_id ===
                                          option.id.toString()
                                      );
                                    if (
                                      currentOption &&
                                      (!currentOption.qty ||
                                        parseInt(currentOption.qty) < 1)
                                    ) {
                                      const updatedOptions =
                                        formik.values.selectedOptions.map(
                                          (opt) =>
                                            opt.options_id ===
                                            option.id.toString()
                                              ? { ...opt, qty: "1" }
                                              : opt
                                        );
                                      formik.setFieldValue(
                                        "selectedOptions",
                                        updatedOptions
                                      );
                                    }
                                  }}
                                />
                              </div>
                            )}
                          </label>
                        );
                      })}
                    </div>
                    {formik.values.selectedOptions.length > 0 &&
                      formik.values.selectedOptions.some(
                        (opt) => !opt.qty || parseInt(opt.qty) < 1
                      ) && (
                        <p className="text-red-500 text-xs mt-1">
                          Please enter a valid quantity for all selected options
                        </p>
                      )}
                  </div>
                )}

              {/* <div className="col-span-1">
                <label className="form-label mb-2">Coupon Quantity</label>
                <input 
                  type="text" 
                  className="input" 
                  placeholder="Coupon Quantity"
                  {...formik.getFieldProps('qty')}
                />
                {formik.touched.qty && formik.errors.qty && (
                  <p className="text-red-500 text-xs mt-1">{formik.errors.qty}</p>
                )}
              </div> */}

              <div className="col-span-1">
                <label className="form-label mb-2">Booking Date</label>
                <FlowbiteHtmlDatepicker
                  value={formik.values.booking_date}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  name="booking_date"
                  placeholder="Select Booking Date"
                />
                {formik.touched.booking_date && formik.errors.booking_date && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.booking_date}
                  </p>
                )}
              </div>

              <div className="col-span-1">
                <label className="form-label mb-2">Arrival Date</label>
                <FlowbiteHtmlDatepicker
                  value={formik.values.arrival_date}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  name="arrival_date"
                  placeholder="Select Arrival Date"
                />
                {formik.touched.arrival_date && formik.errors.arrival_date && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.arrival_date}
                  </p>
                )}
              </div>

              <div className="col-span-1">
                <label className="form-label mb-2">Branch</label>
                <BranchesSelect formik={formik} />
                {formik.touched.branch_uid && formik.errors.branch_uid && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.branch_uid}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="card-footer py-8 flex justify-end">
        <button
          type="button"
          className="btn btn-primary"
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

export { AddReservationContent };
