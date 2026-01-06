import { useState, useEffect } from "react";
import axios from "axios";
import { KeenIcon } from "@/components/keenicons";
import { useSnackbar } from "notistack";
import { toAbsoluteUrl } from "@/utils";
import { CrudAvatarUpload } from "./CrudAvatarUpload";

/* eslint-disable react/prop-types */
const normalizeAmenityName = (name, fallback = "") => {
  if (!name) return fallback;
  if (typeof name === "string") return name.trim();
  if (typeof name === "object")
    return name.en?.trim() || name.ar?.trim() || fallback;
  return fallback;
};

const normalizeAmenity = (amenity) => {
  if (!amenity) return amenity;
  const normalizedName = normalizeAmenityName(amenity.name, "");
  return { ...amenity, name: normalizedName || amenity.name_arabic || "" };
};

const AmenitiesSidebar = ({
  open,
  onClose,
  spTypeUid,
  onAmenitySelect,
  editingOption,
}) => {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // New offer option form fields
  const [offerOptionForm, setOfferOptionForm] = useState({
    price: "",
    couponQuantity: "",
    titleEnglish: "",
    titleArabic: "",
    descriptionEnglish: "",
    descriptionArabic: "",
    selectedAmenities: [],
    images: [],
    imageFiles: [],
  });

  const { enqueueSnackbar } = useSnackbar();

  useEffect(() => {
    console.log("fetching amenities", open, spTypeUid);
    if (open && spTypeUid) {
      fetchAmenities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, spTypeUid]);

  // Handle editing mode - pre-fill form when editingOption changes
  useEffect(() => {
    if (editingOption) {
      // Support both old format (single image) and new format (array of images)
      const images = Array.isArray(editingOption.images)
        ? editingOption.images
        : editingOption.image
          ? [editingOption.image]
          : [];
      const normalizedAmenities = (editingOption.amenities || []).map(
        normalizeAmenity
      );
      setOfferOptionForm({
        price: editingOption.price || "",
        couponQuantity: editingOption.couponQuantity || "",
        titleEnglish: editingOption.titleEnglish || "",
        titleArabic: editingOption.titleArabic || "",
        descriptionEnglish: editingOption.descriptionEnglish || "",
        descriptionArabic: editingOption.descriptionArabic || "",
        selectedAmenities: normalizedAmenities,
        images: images,
        imageFiles: editingOption.imageFiles || [],
      });
      setSelectedAmenities(normalizedAmenities);
    } else {
      // Reset form when not editing
      setOfferOptionForm({
        price: "",
        couponQuantity: "",
        titleEnglish: "",
        titleArabic: "",
        descriptionEnglish: "",
        descriptionArabic: "",
        selectedAmenities: [],
        images: [],
        imageFiles: [],
      });
      setSelectedAmenities([]);
    }
  }, [editingOption]);

  const fetchAmenities = async () => {
    try {
      setLoading(true);
      const storedAuth = localStorage.getItem(
        import.meta.env.VITE_APP_NAME +
          "-auth-v" +
          import.meta.env.VITE_APP_VERSION
      );
      const authData = storedAuth ? JSON.parse(storedAuth) : null;
      const token = authData?.access_token;

      if (!token) {
        window.location.href = "/auth/login";
        return;
      }

      const url = `${import.meta.env.VITE_APP_API_URL}/amenities?include=spType&filter[sp_type_uid]=${spTypeUid}`;
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("res", res);

      const amenitiesData = res.data?.data ?? [];
      setAmenities(amenitiesData.map(normalizeAmenity));
      console.log(amenitiesData);
    } catch (err) {
      console.error("❌ Error fetching amenities:", err);
      enqueueSnackbar("Error fetching amenities", { variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (files, imageURLs) => {
    setOfferOptionForm((prev) => {
      // Revoke old preview URLs if present
      prev.images.forEach((img) => {
        if (img && img.startsWith("blob:")) {
          try {
            URL.revokeObjectURL(img);
          } catch {
            /* noop */
          }
        }
      });

      // Handle array of files
      const imageFiles = Array.isArray(files) ? files : [];

      // Use provided imageURLs if available (maintains order including existing images)
      // Otherwise, create previews from new files
      let previews = [];
      if (imageURLs && Array.isArray(imageURLs) && imageURLs.length > 0) {
        previews = imageURLs;
      } else {
        previews = imageFiles.map((file) => {
          try {
            return URL.createObjectURL(file);
          } catch {
            return "";
          }
        });
      }

      return {
        ...prev,
        imageFiles: imageFiles,
        images: previews,
      };
    });
  };

  const handleOfferOptionInputChange = (e) => {
    const { name, value } = e.target;
    setOfferOptionForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAmenityToggle = (amenity) => {
    setSelectedAmenities((prev) => {
      const exists = prev.find((a) => a.id === amenity.id);
      if (exists) {
        const newAmenities = prev.filter((a) => a.id !== amenity.id);
        setOfferOptionForm((prevForm) => ({
          ...prevForm,
          selectedAmenities: newAmenities,
        }));
        return newAmenities;
      } else {
        const newAmenities = [...prev, amenity];
        setOfferOptionForm((prevForm) => ({
          ...prevForm,
          selectedAmenities: newAmenities,
        }));
        return newAmenities;
      }
    });
  };

  const handleCreateOfferOption = async () => {
    if (
      !offerOptionForm.price ||
      !offerOptionForm.couponQuantity ||
      !offerOptionForm.titleEnglish ||
      !offerOptionForm.titleArabic
    ) {
      enqueueSnackbar("Please fill all required fields", { variant: "error" });
      return;
    }

    if (selectedAmenities.length === 0) {
      enqueueSnackbar("Please select at least one amenity", {
        variant: "error",
      });
      return;
    }

    // Create the offer option object
    const offerOptionData = {
      id: editingOption ? editingOption.id : Date.now(), // Keep existing ID if editing
      price: offerOptionForm.price,
      couponQuantity: offerOptionForm.couponQuantity,
      titleEnglish: offerOptionForm.titleEnglish,
      titleArabic: offerOptionForm.titleArabic,
      descriptionEnglish: offerOptionForm.descriptionEnglish,
      descriptionArabic: offerOptionForm.descriptionArabic,
      amenities: selectedAmenities,
      images: offerOptionForm.images || [],
      imageFiles: offerOptionForm.imageFiles || [],
    };

    // Persist previews to localStorage and ensure parent receives durable dataURLs
    if (offerOptionData.imageFiles && offerOptionData.imageFiles.length > 0) {
      const dataUrls = await Promise.all(
        offerOptionData.imageFiles.map((file) => fileToDataURL(file))
      );
      offerOptionData.images = dataUrls.filter((url) => url); // Filter out empty strings
      upsertPreviewToLS(offerOptionData.id, offerOptionData.images);
    } else if (offerOptionData.images && offerOptionData.images.length > 0) {
      // If we already have previews (editing case), store them too
      upsertPreviewToLS(offerOptionData.id, offerOptionData.images);
    }

    // Send to parent component
    onAmenitySelect && onAmenitySelect(offerOptionData);

    // Reset form
    // Revoke created preview URLs when resetting
    offerOptionForm.images.forEach((img) => {
      if (img && img.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(img);
        } catch {
          /* noop */
        }
      }
    });
    setOfferOptionForm({
      price: "",
      couponQuantity: "",
      titleEnglish: "",
      titleArabic: "",
      descriptionEnglish: "",
      descriptionArabic: "",
      selectedAmenities: [],
      images: [],
      imageFiles: [],
    });
    setSelectedAmenities([]);

    const action = editingOption ? "updated" : "created";
    enqueueSnackbar(`Offer option ${action} successfully!`, {
      variant: "success",
    });
    onClose();
  };

  const filteredAmenities = amenities;

  // Helpers for persisting option preview to localStorage
  const LS_KEY = "offer_option_previews";
  const readPreviewsFromLS = () => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    } catch {
      return [];
    }
  };
  const writePreviewsToLS = (records) => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(records));
    } catch {
      /* noop */
    }
  };
  const upsertPreviewToLS = (id, imageDataUrls) => {
    const list = readPreviewsFromLS();
    const idx = list.findIndex((r) => r && r.id === id);
    // Support both single image (legacy) and array of images
    const images = Array.isArray(imageDataUrls)
      ? imageDataUrls
      : [imageDataUrls];
    if (idx >= 0) list[idx] = { id, images: images };
    else list.push({ id, images: images });
    writePreviewsToLS(list);
  };
  const fileToDataURL = (file) =>
    new Promise((resolve) => {
      if (!file) return resolve("");
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result || "");
      reader.onerror = () => resolve("");
      reader.readAsDataURL(file);
    });

  return (
    <>
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* Sidebar */}
          <div className="fixed card pb-4 right-0 top-0 h-full w-[600px] max-w-[90vw] bg-gray-100 dark:bg-gray-100 shadow-2xl z-50 overflow-hidden overflow-y-auto">
            {/* Header - Fixed */}
            <div className="flex items-center justify-between mb-6 flex-1 max-h-[100px] card-header">
              <h2 className="text-xl font-semibold">
                {editingOption ? "Edit Offer Option" : "Add New Option"}
              </h2>
              <button onClick={onClose} className="btn btn-icon btn-sm">
                <KeenIcon icon="cross" />
              </button>
            </div>
            <div className="card-body">
              {/* Offer Option Form - Fixed */}
              <div className="card mb-4 dark:bg-gray-200 bg-gray-100 rounded-lg">
                <div className="card-body flex flex-col gap-y-4 justify-center items-center">
                  <CrudAvatarUpload
                    onFileChange={handleFileChange}
                    avatarURL={offerOptionForm.images}
                    maxFiles={8}
                  />
                  <p className="text-sm text-center text-gray-500 mt-1">
                    Only *.png, *.jpg, and *.jpeg image files are accepted. Drag
                    images to reorder.
                  </p>
                </div>
              </div>
              <div className="mb-6 p-4 border rounded-lg bg-gray-200 ">
                <div className="grid grid-cols-2 gap-4 mb-4 ">
                  <div>
                    <label className="label">
                      <span className="label-text">Price</span>
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={offerOptionForm.price}
                      onChange={handleOfferOptionInputChange}
                      className="input input-bordered w-full"
                      placeholder="Enter price"
                      required
                    />
                  </div>

                  <div>
                    <label className="label">
                      <span className="label-text">Coupon Quantity</span>
                    </label>
                    <input
                      type="number"
                      name="couponQuantity"
                      value={offerOptionForm.couponQuantity}
                      onChange={handleOfferOptionInputChange}
                      className="input input-bordered w-full"
                      placeholder="Enter quantity"
                      required
                    />
                  </div>
                </div>

                <div className="mb-4">
                  <label className="label">
                    <span className="label-text">Offer Title (English)</span>
                  </label>
                  <input
                    type="text"
                    name="titleEnglish"
                    value={offerOptionForm.titleEnglish}
                    onChange={handleOfferOptionInputChange}
                    className="input input-bordered w-full"
                    placeholder="Enter title in English"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="label">
                    <span className="label-text">إسم العرض (Arabic)</span>
                  </label>
                  <input
                    type="text"
                    name="titleArabic"
                    value={offerOptionForm.titleArabic}
                    onChange={handleOfferOptionInputChange}
                    className="input input-bordered w-full"
                    placeholder="أدخل العنوان بالعربية"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="label">
                    <span className="label-text">
                      Offer Description (English)
                    </span>
                  </label>
                  <textarea
                    name="descriptionEnglish"
                    value={offerOptionForm.descriptionEnglish}
                    onChange={handleOfferOptionInputChange}
                    className="textarea textarea-bordered w-full"
                    placeholder="Enter description in English"
                    rows="2"
                  />
                </div>

                <div className="mb-4">
                  <label className="label">
                    <span className="label-text">وصف العرض (Arabic)</span>
                  </label>
                  <textarea
                    name="descriptionArabic"
                    value={offerOptionForm.descriptionArabic}
                    onChange={handleOfferOptionInputChange}
                    className="textarea textarea-bordered w-full"
                    placeholder="أدخل الوصف بالعربية"
                    rows="2"
                  />
                </div>
              </div>

              {/* Amenities Section - Scrollable */}
              <div className="flex-1 ">
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">
                    Do you have any amenities?
                  </h3>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="loading loading-spinner loading-md"></div>
                  </div>
                ) : filteredAmenities.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No amenities found
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-3 pb-4">
                    {filteredAmenities.map((amenity) => {
                      const isSelected = selectedAmenities.some(
                        (a) => a.id === amenity.id
                      );
                      return (
                        <div
                          key={amenity.id}
                          className={`relative p-3 border rounded-lg cursor-pointer transition-all duration-200 group ${
                            isSelected
                              ? "border-purple-500 bg-purple-50"
                              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                          }`}
                          onClick={() => handleAmenityToggle(amenity)}
                        >
                          {/* Selection Indicator */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                              <KeenIcon
                                icon="check"
                                className="text-white text-xs"
                              />
                            </div>
                          )}

                          <div className="flex flex-col items-center text-center">
                            <img
                              src={
                                amenity.icon ||
                                toAbsoluteUrl("/media/avatars/blank.png")
                              }
                              alt={amenity.name}
                              className="w-12 h-12 rounded-lg object-cover mb-2"
                              onError={(e) => {
                                e.target.src = toAbsoluteUrl(
                                  "/media/avatars/blank.png"
                                );
                              }}
                            />
                            <div className="text-sm font-medium text-gray-800">
                              {amenity.name}
                            </div>
                            {amenity.name_arabic && (
                              <div className="text-xs text-gray-500 mt-1">
                                {amenity.name_arabic}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Footer - Fixed */}
            <div className="mt-6 pt-4 border-t flex-shrink-0 card-footer">
              <div className="flex w-full justify-between items-center">
                <div className="text-sm text-gray-600">
                  {selectedAmenities.length} amenity
                  {selectedAmenities.length !== 1 ? "ies" : "y"} selected
                </div>
                <button
                  onClick={handleCreateOfferOption}
                  className="btn btn-primary"
                >
                  {editingOption
                    ? "Update Offer Option"
                    : "Create Offer Option"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export { AmenitiesSidebar };
