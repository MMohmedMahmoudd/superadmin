import { useState, useEffect } from "react";
import axios from "axios";
import { Tabs, Tab, TabsList, TabPanel } from "@/components/tabs";
import { toAbsoluteUrl } from "@/utils";
import "leaflet/dist/leaflet.css";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { CrudMultiImageUpload } from "./CrudMultiImageUpload";
import { CrudVideoUpload } from "./CrudVideoUpload";
import { BusinessSelect } from "./BusinessSelect";
import { CategorySelect } from "./CategorySelect";
import { FlowbiteHtmlDatepicker } from "@/components";
import { BranchesSelect } from "./BranchesSelect";
import { CitySelect } from "./CitySelect";
import RichTextEditor from "@/components/RichTextEditor";
import { AmenitiesSidebar } from "./AmenitiesSidebar";
import { KeenIcon } from "@/components/keenicons";
import YesNoSelect from "@/components/YesNoSelect";
import Select from "react-select";
import { customSelectStyles } from "../../Bussiness/AddBussiness/ZoneSelect";

const AddOffersContent = () => {
  const [activeTab, setActiveTab] = useState("English");
  const [loading, setLoading] = useState(false);
  const [amenitiesSidebarOpen, setAmenitiesSidebarOpen] = useState(false);
  const [offerOptions, setOfferOptions] = useState([]);
  const [editingOption, setEditingOption] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      business_id: "",
      businessData: "",
      cat_uid: "",
      offer_price: "",
      offer_copouns_qty: "",
      offer_images: [],
      offer_end_date: "",
      coupon_end_date: "",
      checkAvailability: 0, // 0 by default
      // English
      offer_title_english: "",
      offer_description_english: "",
      offer_cancel_policy_english: "",
      offer_know_before_go_english: "",
      // Arabic
      offer_title_arabic: "",
      offer_description_arabic: "",
      offer_cancel_policy_arabic: "",
      offer_know_before_go_arabic: "",
      branches_id: [],
      offer_status: "",
      city_name: "",
      city_uid: "",
      amenities: [],
      is_best_offer: "",
      offer_things_to_do: "",
      offer_video: null,
    },
    validationSchema: Yup.object({
      business_id: Yup.string().required("Business is required"),
      cat_uid: Yup.string().required("Category is required"),
      offer_price: Yup.string().required("Price is required"),
      offer_copouns_qty: Yup.string().required("Coupon quantity is required"),
      offer_end_date: Yup.string().required("Offer end date is required"),
      coupon_end_date: Yup.string().required("Coupon end date is required"),
      offer_title_english: Yup.string().required("English title is required"),
      offer_description_english: Yup.string().required(
        "English description is required"
      ),
      offer_title_arabic: Yup.string().required("Arabic title is required"),
      offer_description_arabic: Yup.string().required(
        "Arabic description is required"
      ),
      offer_status: Yup.string().required("Status is required"),
      offer_images: Yup.array()
        .of(Yup.mixed())
        .required("Offer images are required"),
      offer_cancel_policy_english: Yup.string().required(
        "English cancellation policy is required"
      ),
      offer_cancel_policy_arabic: Yup.string().required(
        "Arabic cancellation policy is required"
      ),
      offer_know_before_go_english: Yup.string().required(
        "English terms and conditions are required"
      ),
      offer_know_before_go_arabic: Yup.string().required(
        "Arabic terms and conditions are required"
      ),
      branches_id: Yup.array()
        .min(1, "At least one branch must be selected")
        .required("Branch is required"),
      city_name: Yup.string().required("City is required"),
      city_uid: Yup.string().required("City is required"),
    }),
    onSubmit: (values) => {
      console.log("Form submitted:", values);
      // your submission logic here
    },
  });

  const { offer_end_date: offerEndDate, coupon_end_date: couponEndDate } =
    formik.values;
  const { setFieldValue } = formik;

  useEffect(() => {
    if (offerEndDate && couponEndDate !== offerEndDate) {
      setFieldValue("coupon_end_date", offerEndDate, false);
    }
  }, [offerEndDate, couponEndDate, setFieldValue]);

  const handleFileChange = (files) => {
    formik.setFieldValue("offer_images", files);
  };

  const handleVideoChange = (video) => {
    formik.setFieldValue("offer_video", video);
  };

  const handleAmenitySelect = (amenity) => {
    // If it's an offer option (has price, title, etc.)
    if (amenity.price && amenity.titleEnglish) {
      if (editingOption) {
        // Update existing option
        setOfferOptions((prev) =>
          prev.map((option) =>
            option.id === editingOption.id ? amenity : option
          )
        );
        setEditingOption(null); // Clear editing state
      } else {
        // Create new option
        setOfferOptions((prev) => [...prev, amenity]);
      }
      return;
    }

    // Original amenity selection logic
    const current = Array.isArray(formik.values.amenities)
      ? formik.values.amenities
      : [];
    const exists = current.find((a) => a.id === amenity.id);
    const next = exists
      ? current.filter((a) => a.id !== amenity.id)
      : [...current, amenity];
    formik.setFieldValue("amenities", next);
  };

  const handleDeleteOfferOption = (optionId) => {
    setOfferOptions((prev) => prev.filter((option) => option.id !== optionId));
    enqueueSnackbar("Offer option deleted successfully!", {
      variant: "success",
    });
  };

  const handleEditOfferOption = (option) => {
    setEditingOption(option);
    setAmenitiesSidebarOpen(true);
  };

  const handleCloseSidebar = () => {
    setAmenitiesSidebarOpen(false);
    setEditingOption(null); // Reset editing state when closing
  };

  // Pull durable previews from localStorage for any options that have an id but missing images
  useEffect(() => {
    try {
      const list = JSON.parse(
        localStorage.getItem("offer_option_previews") || "[]"
      );
      if (!Array.isArray(list) || list.length === 0) return;
      setOfferOptions((prev) =>
        prev.map((opt) => {
          if (
            (!opt.images || opt.images.length === 0) &&
            !opt.image &&
            opt.id
          ) {
            const rec = list.find((r) => r && r.id === opt.id);
            if (rec?.images) {
              // New format: array of images
              return { ...opt, images: rec.images };
            } else if (rec?.image) {
              // Legacy format: single image
              return { ...opt, image: rec.image, images: [rec.image] };
            }
          }
          return opt;
        })
      );
    } catch {
      /* noop */
    }
  }, [amenitiesSidebarOpen]);

  // no-op

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

      data.append("cat_uid", formik.values.cat_uid);
      data.append("offer_price", formik.values.offer_price);
      data.append("offer_copouns_qty", formik.values.offer_copouns_qty);
      data.append("offer_end_date", formik.values.offer_end_date);
      data.append("coupon_end_date", formik.values.offer_end_date);
      // City UID required by API
      data.append("city_uid", formik.values.city_uid);

      // Multi-language
      data.append("offer_title_english", formik.values.offer_title_english);
      data.append(
        "offer_description_english",
        formik.values.offer_description_english
      );
      data.append(
        "offer_cancel_policy_english",
        formik.values.offer_cancel_policy_english
      );
      data.append(
        "offer_know_before_go_english",
        formik.values.offer_know_before_go_english
      );

      data.append("offer_title_arabic", formik.values.offer_title_arabic);
      data.append(
        "offer_description_arabic",
        formik.values.offer_description_arabic
      );
      data.append(
        "offer_cancel_policy_arabic",
        formik.values.offer_cancel_policy_arabic
      );
      data.append(
        "offer_know_before_go_arabic",
        formik.values.offer_know_before_go_arabic
      );

      // offer_status and check availability
      data.append("offer_status", formik.values.offer_status);
      data.append("check_availability", formik.values.checkAvailability);

      // Add the new fields
      if (formik.values.is_best_offer !== "") {
        data.append("is_best_offer", formik.values.is_best_offer);
      }
      if (formik.values.offer_things_to_do !== "") {
        data.append("offer_things_to_do", formik.values.offer_things_to_do);
      }

      // Build options as indexed multipart fields: options[0][field], options[0][amenities][], options[0][images][]
      if (offerOptions && offerOptions.length > 0) {
        offerOptions.forEach((opt, idx) => {
          if (opt.id) data.append(`options[${idx}][id]`, String(opt.id));
          if (opt.price !== undefined)
            data.append(`options[${idx}][price]`, String(opt.price));
          if (opt.couponQuantity !== undefined)
            data.append(
              `options[${idx}][coupons_qty]`,
              String(opt.couponQuantity)
            );
          if (opt.titleEnglish !== undefined)
            data.append(`options[${idx}][title]`, opt.titleEnglish);
          if (opt.titleArabic !== undefined)
            data.append(`options[${idx}][title_ar]`, opt.titleArabic);
          if (opt.descriptionEnglish !== undefined)
            data.append(`options[${idx}][description]`, opt.descriptionEnglish);
          if (opt.descriptionArabic !== undefined)
            data.append(
              `options[${idx}][description_ar]`,
              opt.descriptionArabic
            );
          const amenityIds = Array.isArray(opt.amenities)
            ? opt.amenities.map((a) => a.id)
            : [];
          amenityIds.forEach((id) =>
            data.append(`options[${idx}][amenities][]`, String(id))
          );
          // Images: append all imageFiles as options[idx][images][] according to backend format
          // Support both new format (imageFiles array) and legacy format (single imageFile)
          if (opt.imageFiles && Array.isArray(opt.imageFiles)) {
            opt.imageFiles.forEach((imageFile) => {
              if (imageFile instanceof File) {
                data.append(`options[${idx}][images][]`, imageFile);
              }
            });
          } else if (opt.imageFile instanceof File) {
            // Legacy support for single imageFile
            data.append(`options[${idx}][images][]`, opt.imageFile);
          }
        });
      }
      // Before sending form
      if (formik.values.branches_id.length === 0) {
        enqueueSnackbar("Please select at least one branch.", {
          variant: "error",
        });
        return;
      }

      const branchesPayload = formik.values.branches_id.includes("all")
        ? ["all"]
        : formik.values.branches_id.map((id) => id.toString());

      data.append("branches_id", JSON.stringify(branchesPayload));

      // Images as a single indexed array: images[0], images[1], ...
      formik.values.offer_images.forEach((file, idx) => {
        if (file) {
          data.append(`images[${idx}]`, file);
        }
      });

      // Video upload
      if (formik.values.offer_video) {
        data.append("offer_video", formik.values.offer_video);
      }

      // Debug: log FormData keys and values before submit
      try {
        const debugEntries = [];
        // FormData.entries() is supported in modern browsers
        for (const [key, value] of data.entries()) {
          if (value instanceof File) {
            debugEntries.push({
              key,
              value: `File(name=${value.name}, size=${value.size})`,
            });
          } else {
            debugEntries.push({ key, value });
          }
        }
        console.groupCollapsed("🧾 Offer submit payload (FormData)");
        console.table(debugEntries);
        console.groupEnd();
      } catch {
        // no-op debug
      }

      const token = JSON.parse(
        localStorage.getItem(
          import.meta.env.VITE_APP_NAME +
            "-auth-v" +
            import.meta.env.VITE_APP_VERSION
        )
      )?.access_token;

      const response = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/provider/${formik.values.business_id}/offer/create`,
        data,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      console.log("✅ Offer Created:", response.data);
      enqueueSnackbar("Offer created successfully!", { variant: "success" });
      navigate("/Offers");
    } catch (error) {
      console.error("❌ Submission failed:", error);

      // Extract errors from various possible locations in the response
      const errorData =
        error?.response?.data?.data || error?.response?.data?.errors || {};

      // Function to flatten nested error objects and extract all messages
      const extractErrorMessages = (errors, prefix = "") => {
        const messages = [];

        for (const [key, value] of Object.entries(errors)) {
          const fullKey = prefix ? `${prefix}.${key}` : key;

          if (Array.isArray(value)) {
            // If it's an array, add each message
            value.forEach((msg) => {
              messages.push(`${fullKey}: ${msg}`);
            });
          } else if (typeof value === "object" && value !== null) {
            // If it's nested, recursively extract
            messages.push(...extractErrorMessages(value, fullKey));
          } else if (typeof value === "string") {
            messages.push(`${fullKey}: ${value}`);
          }
        }

        return messages;
      };

      const errorMessages = extractErrorMessages(errorData);
      const mainMessage = error?.response?.data?.message || "Validation errors";

      // Display all error messages
      if (errorMessages.length > 0) {
        // Show first error as snackbar
        enqueueSnackbar(`${mainMessage}: ${errorMessages[0]}`, {
          variant: "error",
        });
        // Log all errors to console
        console.group("⚠️ Validation Errors:");
        errorMessages.forEach((msg) => console.error(msg));
        console.groupEnd();
      } else {
        enqueueSnackbar(
          mainMessage || "Something went wrong. Please try again.",
          { variant: "error" }
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="w-full" onSubmit={formik.handleSubmit}>
      {/* Dashed Line Separator Between Steps */}

      {/* Stepper Body */}
      <div className="card-body p-1 ">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="col-span-3 xl:col-span-2 card ">
            <div className="card-header">
              <h3 className="  card-title">Business Information</h3>
            </div>
            <div className="grid card-body grid-cols-2 gap-4">
              <div>
                <label className="form-label mb-1">Business Name</label>
                <BusinessSelect formik={formik} />
              </div>
              <div>
                <label className="form-label mb-1">Status</label>
                <Select
                  classNamePrefix="react-select"
                  options={[
                    {
                      value: "1",
                      label: "Active",
                    },
                    {
                      value: "2",
                      label: "Pending",
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
                        value: "2",
                        label: "Pending",
                      },
                      {
                        value: "0",
                        label: "Inactive",
                      },
                    ].find((opt) => opt.value == formik.values.offer_status) ||
                    null
                  }
                  onChange={(newValue) => {
                    formik.setFieldValue(
                      "offer_status",
                      newValue ? newValue.value : ""
                    );
                  }}
                  styles={customSelectStyles}
                ></Select>
                {formik.touched.offer_status && formik.errors.offer_status && (
                  <span role="alert" className="text-danger text-xs mt-1">
                    {formik.errors.offer_status}
                  </span>
                )}
              </div>
              <div>
                <label className="form-label mb-1">Select Category</label>
                <CategorySelect
                  formik={formik}
                  typeId={formik.values.businessData?.type?.id || ""}
                />
              </div>
              <div>
                <label className="form-label mb-1">Price</label>
                <input
                  type="number"
                  className="input"
                  {...formik.getFieldProps("offer_price")}
                />
                {formik.touched.offer_price && formik.errors.offer_price && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.offer_price}
                  </p>
                )}
              </div>
              <div>
                <label className="form-label mb-1">Coupon Quantity</label>
                <input
                  type="number"
                  className="input"
                  {...formik.getFieldProps("offer_copouns_qty")}
                />
                {formik.touched.offer_copouns_qty &&
                  formik.errors.offer_copouns_qty && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.offer_copouns_qty}
                    </p>
                  )}
              </div>
              <div className="hidden">
                <label className="form-label mb-1">Coupon Valid Date</label>
                <FlowbiteHtmlDatepicker
                  value={formik.values.coupon_end_date}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  name="coupon_end_date" // ✅ important for Formik
                  placeholder="Select Coupon Valid Date"
                />
                {formik.touched.coupon_end_date &&
                  formik.errors.coupon_end_date && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.coupon_end_date}
                    </p>
                  )}
              </div>

              <div className="col-span-1 ">
                <label className="form-label mb-1">Offer Valid Date</label>
                <FlowbiteHtmlDatepicker
                  value={formik.values.offer_end_date}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  name="offer_end_date" // ✅ important for Formik
                  placeholder="Select Offer Valid Date"
                />
                {formik.touched.offer_end_date &&
                  formik.errors.offer_end_date && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.offer_end_date}
                    </p>
                  )}
              </div>
            </div>
          </div>
          {/* End of Business Information Card */}

          <div className="card col-span-2">
            <div className="card-header">
              <h3 className="card-title">Offer Options</h3>
            </div>
            <div className="card-body">
              {/* Display existing offer options */}
              {offerOptions.length > 0 && (
                <div className="space-y-4 mb-6">
                  {offerOptions.map((option) => (
                    <div
                      key={option.id}
                      className="flex items-center gap-4 p-4 border rounded-lg bg-gray-200"
                    >
                      {/* Drag Handle */}
                      {/* <div className="cursor-move text-gray-400">
                        <KeenIcon icon="menu" />
                      </div> */}

                      {/* Images Preview */}
                      <div className="relative">
                        {(() => {
                          // Support both new format (images array) and legacy format (single image)
                          let images =
                            Array.isArray(option.images) &&
                            option.images.length > 0
                              ? option.images
                              : option.image
                                ? [option.image]
                                : [];

                          // If no images on the option, try to read from localStorage (durable previews)
                          if (images.length === 0 && option?.id) {
                            try {
                              const list = JSON.parse(
                                localStorage.getItem("offer_option_previews") ||
                                  "[]"
                              );
                              const rec = Array.isArray(list)
                                ? list.find((r) => r && r.id === option.id)
                                : null;
                              if (
                                rec?.images &&
                                Array.isArray(rec.images) &&
                                rec.images.length > 0
                              ) {
                                images = rec.images;
                              } else if (rec?.image) {
                                images = [rec.image];
                              }
                            } catch {
                              /* noop */
                            }
                          }

                          if (images.length === 0) {
                            return (
                              <img
                                src={toAbsoluteUrl("/media/avatars/blank.png")}
                                alt={option.titleEnglish || "Option image"}
                                className="w-16 h-16 rounded-lg object-cover border border-gray-300"
                                onError={(e) => {
                                  e.currentTarget.src = toAbsoluteUrl(
                                    "/media/avatars/blank.png"
                                  );
                                }}
                              />
                            );
                          }

                          // Show all images in a horizontal scrollable gallery
                          return (
                            <div className="flex items-center gap-1.5 max-w-[200px] overflow-x-auto pb-1">
                              {images.map((img, idx) => (
                                <div
                                  key={idx}
                                  className="relative flex-shrink-0"
                                >
                                  <img
                                    src={
                                      img ||
                                      toAbsoluteUrl("/media/avatars/blank.png")
                                    }
                                    alt={`${option.titleEnglish} - Image ${idx + 1}`}
                                    className="w-14 h-14 rounded-lg object-cover border border-gray-300 cursor-pointer hover:opacity-80 transition-opacity"
                                    onError={(e) => {
                                      e.currentTarget.src = toAbsoluteUrl(
                                        "/media/avatars/blank.png"
                                      );
                                    }}
                                  />
                                  {/* Show image number badge for multiple images */}
                                  {images.length > 1 && (
                                    <div className="absolute -top-1 -right-1 bg-gray-800 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
                                      {idx + 1}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg">
                          {option.titleEnglish}
                        </h4>
                        <p className="text-gray-600 text-sm mb-2">
                          {option.descriptionEnglish}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                          {Array.isArray(option.amenities) &&
                          option.amenities.length > 0 ? (
                            <>
                              {option.amenities.slice(0, 5).map((amenity) => (
                                <span
                                  key={amenity.id ?? amenity.name}
                                  className="inline-flex items-center gap-1"
                                >
                                  {amenity.icon ? (
                                    <img
                                      src={amenity.icon}
                                      alt={amenity.name}
                                      className="w-4 h-4 object-contain rounded"
                                      onError={(e) => {
                                        e.currentTarget.style.display = "none";
                                      }}
                                    />
                                  ) : (
                                    <KeenIcon
                                      icon="element-11"
                                      className="w-4 h-4"
                                    />
                                  )}
                                  {amenity.name}
                                </span>
                              ))}
                              {option.amenities.length > 5 && (
                                <span className="text-gray-400">
                                  +{option.amenities.length - 5} more
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-gray-400">
                              No amenities selected
                            </span>
                          )}
                        </div>

                        <div className="mt-2 text-sm text-gray-600">
                          Coupon Quantity: {option.couponQuantity}
                        </div>
                      </div>

                      {/* Price and Actions */}
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-800 mb-2">
                          {option.price} EGP
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditOfferOption(option)}
                            className="btn btn-sm btn-outline"
                          >
                            <KeenIcon icon="notepad-edit" />
                          </button>
                          <button
                            onClick={() => handleDeleteOfferOption(option.id)}
                            className="btn btn-sm btn-outline btn-error"
                          >
                            <KeenIcon icon="trash" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new option button */}
              <div className="flex justify-center items-center dark:bg-gray-200 bg-gray-100 rounded-lg py-4">
                <button
                  type="button"
                  onClick={() => setAmenitiesSidebarOpen(true)}
                  className="btn btn-outline btn-primary flex items-center gap-2"
                >
                  <KeenIcon icon="plus" />
                  Add new option
                </button>
              </div>
            </div>
          </div>

          {/* branche and city card */}
          <div className="card col-span-2 ">
            <div className="card-header">
              <h3 className="card-title">
                Branches Where the Offer is Available
              </h3>
            </div>
            <div className="card-body grid grid-cols-1 gap-4">
              <div className="form-group">
                <label className="form-label mb-1">City</label>
                <CitySelect formik={formik} />
                {formik.touched.city_name && formik.errors.city_name && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.city_name}
                  </p>
                )}
              </div>
              <div className="form-group">
                <label className="form-label mb-1">Branch</label>
                <BranchesSelect
                  providerId={formik.values.businessData?.id}
                  selectedCity={formik.values.city_name}
                  formik={formik}
                />
                {formik.touched.branches_id && formik.errors.branches_id && (
                  <p className="text-red-500 text-xs mt-1">
                    {formik.errors.branches_id}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Start of activity Card */}
          <div className="card   col-span-2 ">
            {/* Card Header */}
            <div className=" card-header ">
              <h3 className="card-title ">Availability Check</h3>
            </div>

            {/* Card Body */}
            <div className="flex card-body flex-col gap-4 ">
              {/* Toggle Section */}
              <div className="flex items-center justify-between">
                <h4 className="text-base font-medium  ">
                  Require Availability Check
                </h4>
                <label className="flex switch items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="toggle toggle-sm"
                    checked={formik.values.checkAvailability === 1}
                    onChange={(e) =>
                      formik.setFieldValue(
                        "checkAvailability",
                        e.target.checked ? 1 : 0
                      )
                    }
                  />
                </label>
              </div>

              {/* Description Text */}
              <p className="text-sm  leading-relaxed">
                When clicked, the button in the mobile app will change to “Check
                Availability”. Upon clicking, the user will be prompted to
                select a date, after which a request will be sent to the service
                provider to confirm availability.
              </p>
            </div>
          </div>

          {/* End of activity Card */}

          {/* Best Offer and Things to Do Card */}
          <div className="card col-span-2">
            <div className="card-header">
              <h3 className="card-title">Offer Settings</h3>
            </div>
            <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label mb-1">Best Offer</label>
                <YesNoSelect
                  name="is_best_offer"
                  value={formik.values.is_best_offer}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Select if this is a best offer"
                  error={
                    formik.touched.is_best_offer && formik.errors.is_best_offer
                  }
                />
                {formik.touched.is_best_offer &&
                  formik.errors.is_best_offer && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.is_best_offer}
                    </p>
                  )}
              </div>
              <div className="form-group">
                <label className="form-label mb-1">Things to Do</label>
                <YesNoSelect
                  name="offer_things_to_do"
                  value={formik.values.offer_things_to_do}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Select if this offer includes things to do"
                  error={
                    formik.touched.offer_things_to_do &&
                    formik.errors.offer_things_to_do
                  }
                />
                {formik.touched.offer_things_to_do &&
                  formik.errors.offer_things_to_do && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.offer_things_to_do}
                    </p>
                  )}
              </div>
            </div>
          </div>

          {/* Basic Photos Card */}

          <div className="parent-cruds xl:col-span-2 col-span-3 card p-6">
            <div className="flex justify-center items-center dark:bg-gray-200 bg-gray-100 rounded-lg py-4 flex-col gap-y-4 mb-4">
              <label className="block text-sm font-medium mb-1">
                Offer Images (max 8)
              </label>
              <CrudMultiImageUpload onFilesChange={handleFileChange} />
              <p className="text-sm text-center text-gray-500 mt-1">
                Only *.png, *.jpg, and *.jpeg image files are accepted.
              </p>
            </div>
          </div>

          {/* Video Upload Card */}
          <div className="parent-cruds xl:col-span-2 col-span-3 card p-6">
            <div className="flex justify-center items-center dark:bg-gray-200 bg-gray-100 rounded-lg py-4 flex-col gap-y-4 mb-4">
              <label className="block text-sm font-medium mb-1">
                Offer Video (Optional)
              </label>
              <CrudVideoUpload onVideoChange={handleVideoChange} />
            </div>
          </div>
          {/* Multi Language Content Card */}

          <div className="card col-span-2">
            {/* <div className="card-header">
              <h3 className="card-title">Multi Language Content</h3>
            </div> */}
            <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-group mb-4">
                <label className="form-label mb-1">Offer Title</label>
                <input
                  type="text"
                  className="input"
                  {...formik.getFieldProps("offer_title_english")}
                />
                {formik.touched.offer_title_english &&
                  formik.errors.offer_title_english && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.offer_title_english}
                    </p>
                  )}
              </div>
              <div className="form-group mb-4">
                <label className="form-label mb-1" dir="rtl">
                  إسم العرض
                </label>
                <input
                  type="text"
                  className="input"
                  dir="rtl"
                  {...formik.getFieldProps("offer_title_arabic")}
                  placeholder=" إسم العرض..."
                />
                {formik.touched.offer_title_arabic &&
                  formik.errors.offer_title_arabic && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.offer_title_arabic}
                    </p>
                  )}
              </div>

              <div className="form-group">
                <label className="form-label mb-1">Offer Description</label>
                <RichTextEditor
                  name="offer_description_english"
                  value={formik.values.offer_description_english}
                  onChange={(name, data) => formik.setFieldValue(name, data)}
                  onBlur={(name) => formik.setFieldTouched(name, true)}
                  placeholder="Write the offer description..."
                />
                {formik.touched.offer_description_english &&
                  formik.errors.offer_description_english && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.offer_description_english}
                    </p>
                  )}
              </div>
              <div className="form-group">
                <label className="form-label mb-1" dir="rtl">
                  وصف العرض
                </label>
                <RichTextEditor
                  onBlur={(name) => formik.setFieldTouched(name, true)}
                  className="rtl"
                  name="offer_description_arabic"
                  value={formik.values.offer_description_arabic}
                  onChange={(name, data) => formik.setFieldValue(name, data)}
                  placeholder=" وصف العرض..."
                />
                {formik.touched.offer_description_arabic &&
                  formik.errors.offer_description_arabic && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.offer_description_arabic}
                    </p>
                  )}
              </div>

              <div className="form-group">
                <label className="form-label mb-1">Cancellation Policy</label>
                <RichTextEditor
                  onBlur={(name) => formik.setFieldTouched(name, true)}
                  name="offer_cancel_policy_english"
                  value={formik.values.offer_cancel_policy_english}
                  onChange={(name, data) => formik.setFieldValue(name, data)}
                  placeholder="Write the offer cancellation policy..."
                />
                {formik.touched.offer_cancel_policy_english &&
                  formik.errors.offer_cancel_policy_english && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.offer_cancel_policy_english}
                    </p>
                  )}
              </div>
              <div className="form-group">
                <label className="form-label mb-1" dir="rtl">
                  سياسة الإلغاء
                </label>
                <RichTextEditor
                  onBlur={(name) => formik.setFieldTouched(name, true)}
                  className="rtl"
                  name="offer_cancel_policy_arabic"
                  value={formik.values.offer_cancel_policy_arabic}
                  onChange={(name, data) => formik.setFieldValue(name, data)}
                  placeholder=" سياسة الإلغاء..."
                />
                {formik.touched.offer_cancel_policy_arabic &&
                  formik.errors.offer_cancel_policy_arabic && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.offer_cancel_policy_arabic}
                    </p>
                  )}
              </div>

              <div className="form-group">
                <label className="form-label mb-1">Know Before You Go</label>
                <RichTextEditor
                  name="offer_know_before_go_english"
                  value={formik.values.offer_know_before_go_english}
                  onChange={(name, data) => formik.setFieldValue(name, data)}
                  onBlur={(name) => formik.setFieldTouched(name, true)}
                  placeholder="Write the offer know before you go..."
                />
                {formik.touched.offer_know_before_go_english &&
                  formik.errors.offer_know_before_go_english && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.offer_know_before_go_english}
                    </p>
                  )}
              </div>
              <div className="form-group">
                <label className="form-label mb-1" dir="rtl">
                  الشروط والأحكام
                </label>
                <RichTextEditor
                  onBlur={(name) => formik.setFieldTouched(name, true)}
                  className="rtl"
                  name="offer_know_before_go_arabic"
                  value={formik.values.offer_know_before_go_arabic}
                  onChange={(name, data) => formik.setFieldValue(name, data)}
                  placeholder=" نصائح وإرشادات هامة..."
                />
                {formik.touched.offer_know_before_go_arabic &&
                  formik.errors.offer_know_before_go_arabic && (
                    <p className="text-red-500 text-xs mt-1">
                      {formik.errors.offer_know_before_go_arabic}
                    </p>
                  )}
              </div>
            </div>
          </div>
          {/* end the parent card */}
        </div>
      </div>

      {/* Amenities Sidebar */}
      <AmenitiesSidebar
        open={amenitiesSidebarOpen}
        onClose={handleCloseSidebar}
        spTypeUid={formik.values.businessData?.type?.uid}
        onAmenitySelect={handleAmenitySelect}
        editingOption={editingOption}
      />

      {/* Footer Buttons */}
      <div className="card-footer py-8 flex justify-end">
        <button
          type="button"
          className="btn btn-primary"
          disabled={loading}
          onClick={() => {
            formik.validateForm().then((errors) => {
              if (Object.keys(errors).length === 0) {
                handleSubmit(); // If valid
              } else {
                enqueueSnackbar("Please complete all required fields.", {
                  variant: "error",
                });

                // Touch all fields to show errors
                Object.keys(errors).forEach((key) => {
                  formik.setFieldTouched(key, true);
                });
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

export { AddOffersContent };
