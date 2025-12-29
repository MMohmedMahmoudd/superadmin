import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { KeenIcon } from "@/components";
import { Modal } from "@/components/modal/Modal";
import { useSnackbar } from "notistack";
import { toAbsoluteUrl } from "@/utils";
import { FlowbiteHtmlDatepicker } from "@/components";
const LoadingSpinner = () => (
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

const ReservationDefaultContent = () => {
  const { id } = useParams();
  const [reservationData, setReservationData] = useState(null);
  const [offerData, setOfferData] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDateModalOpen, setIsDateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [couponCodes, setCouponCodes] = useState([]);
  const [paidStatus, setPaidStatus] = useState("2");
  const [bookingStatus, setBookingStatus] = useState("");
  const { enqueueSnackbar } = useSnackbar();

  const fetchReservation = async () => {
    try {
      const token = JSON.parse(
        localStorage.getItem(
          import.meta.env.VITE_APP_NAME +
            "-auth-v" +
            import.meta.env.VITE_APP_VERSION
        )
      )?.access_token;

      if (!token) throw new Error("Authentication token not found");

      const res = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}/reservation/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      if (res.data?.data) {
        setReservationData(res.data.data);
        // Initialize paid status (0 failed, 1 success, 2 no paid)
        if (res.data.data?.paid !== undefined && res.data.data?.paid !== null) {
          setPaidStatus(String(res.data.data.paid));
        } else {
          setPaidStatus("2");
        }
        // Initialize booking status
        // Initialize coupon codes array based on the number of coupons if it's the initial fetch or num_coupons changed
        if (
          !couponCodes.length ||
          couponCodes.length !== res.data.data.num_coupons
        ) {
          setCouponCodes(Array(res.data.data.num_coupons).fill(""));
        }

        // Fetch offer data to get available options
        if (res.data.data.offer_uid) {
          try {
            const offerRes = await axios.get(
              `${import.meta.env.VITE_APP_API_URL}/offer/${res.data.data.offer_uid}`,
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );
            if (offerRes.data?.data) {
              setOfferData(offerRes.data.data);
              // Initialize selectedOptions from existing booking_options if available
              // Note: API response might include booking_options, adjust based on actual response structure
              if (
                res.data.data.booking_options &&
                Array.isArray(res.data.data.booking_options)
              ) {
                setSelectedOptions(
                  res.data.data.booking_options
                    .filter((opt) => opt && opt.option && opt.option.id) // Validate before mapping
                    .map((opt) => ({
                      // API returns option object. We must send its id as option_id.
                      options_id: String(opt.option.id),
                      qty:
                        opt.qty != null && opt.qty > 0 ? String(opt.qty) : "1",
                    }))
                );
              } else {
                setSelectedOptions([]);
              }
            }
          } catch (offerError) {
            // Security: Don't expose detailed error info in production
            const errorMessage = import.meta.env.DEV
              ? `Failed to fetch offer details: ${offerError.message || "Unknown error"}`
              : "Failed to fetch offer details";
            console.error(errorMessage);
            if (import.meta.env.DEV) {
              console.error("Full error:", offerError);
            }
          }
        }
      } else {
        throw new Error("Invalid reservation response");
      }
    } catch (error) {
      // Security: Don't expose detailed error info in production
      const errorMessage = import.meta.env.DEV
        ? `Failed to fetch reservation: ${error.message || "Unknown error"}`
        : "Failed to fetch reservation. Please try again.";
      console.error(errorMessage);
      if (import.meta.env.DEV && error.response) {
        console.error("Error response:", error.response.data);
      }
    }
  };

  useEffect(() => {
    if (id) fetchReservation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Dependency array ensures this runs when id changes

  const handleAddCoupons = async () => {
    try {
      const token = JSON.parse(
        localStorage.getItem(
          import.meta.env.VITE_APP_NAME +
            "-auth-v" +
            import.meta.env.VITE_APP_VERSION
        )
      )?.access_token;

      if (!token) throw new Error("Authentication token not found");

      // Validate coupon codes before sending (API expects a single numeric coupon)
      const validCouponCodes = couponCodes
        .map((code) => code?.trim())
        .filter((code) => code && code.length > 0);
      if (validCouponCodes.length === 0) {
        enqueueSnackbar("Please enter at least one coupon code", {
          variant: "error",
        });
        return;
      }

      const firstCoupon = validCouponCodes[0];
      if (!/^\d+$/.test(firstCoupon)) {
        enqueueSnackbar("Coupon must be digits only", { variant: "error" });
        return;
      }

      const couponPayload = Number(firstCoupon);

      const res = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/reservations/${id}/use-coupon`,
        { coupon: couponPayload },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (res.data?.success) {
        enqueueSnackbar("Coupons added successfully!", { variant: "success" });
        setIsModalOpen(false);
        setCouponCodes(Array(reservationData.num_coupons).fill("")); // Clear inputs
        fetchReservation(); // Refresh reservation data
      } else {
        // Handle potential errors returned from the backend API
        enqueueSnackbar(res.data?.message || "Failed to add coupons", {
          variant: "error",
        });
      }
    } catch (error) {
      // Security: Don't expose detailed error info in production
      const errorMessage = import.meta.env.DEV
        ? `Error adding coupons: ${error.message || "Unknown error"}`
        : "An error occurred while adding coupons.";
      console.error(errorMessage);
      if (import.meta.env.DEV && error.response) {
        console.error("Error response:", error.response.data);
      }
      enqueueSnackbar(
        error.response?.data?.message ||
          "An error occurred while adding coupons.",
        { variant: "error" }
      );
    }
  };

  const handleDateChange = async (customStatus) => {
    try {
      const token = JSON.parse(
        localStorage.getItem(
          import.meta.env.VITE_APP_NAME +
            "-auth-v" +
            import.meta.env.VITE_APP_VERSION
        )
      )?.access_token;

      if (!token) throw new Error("Authentication token not found");

      // Security: Only log sensitive data in development
      if (import.meta.env.DEV) {
        console.log("person_uid:", reservationData.person_uid);
      }

      // Validate and sanitize input data
      const personUid = reservationData.person_uid;
      if (!personUid) {
        enqueueSnackbar(
          "Invalid reservation data: missing person information",
          { variant: "error" }
        );
        return;
      }

      // Build the payload using the required keys and mapping from reservationData
      const payload = {
        _method: "put",
        sp_uid: reservationData.sp_id,
        person_uid: personUid,
        offer_uid: reservationData.offer_uid || "",
        booking_status:
          customStatus ??
          parseInt(bookingStatus || reservationData.status_num, 10),
        arrival_date: selectedDate || reservationData.booking_date,
        qty: reservationData.num_coupons,
        branch_uid: reservationData.provider?.[0]?.main_branch?.id,
        reason: reservationData.reason || "",
        sp_confirmation: reservationData.sp_confirmation,
        paid: paidStatus,
        payment_obj: {
          paid: paidStatus,
          payment_method: "cash",
          payment_status: paidStatus,
          payment_date: new Date().toISOString(),
          payment_amount:
            reservationData.offer_price * reservationData.num_coupons,
          payment_currency: "SAR",
          payment_transaction_id: "1234567890",
        },
      };

      if (import.meta.env.DEV) {
        console.log("provider:", reservationData.provider);
      }
      const formData = new FormData();
      Object.keys(payload).forEach((key) => {
        formData.append(key, payload[key]);
      });

      // Validate and append booking_options. If user didn't edit options,
      // send the options from the current reservation response so the API receives required fields.
      const optionsFromReservation = Array.isArray(
        reservationData.booking_options
      )
        ? reservationData.booking_options.map((opt) => ({
            options_id: opt?.option?.id ? String(opt.option.id) : "",
            qty: opt?.qty != null ? String(opt.qty) : "",
          }))
        : [];

      const optionsToSend =
        selectedOptions && selectedOptions.length > 0
          ? selectedOptions
          : optionsFromReservation;

      if (optionsToSend && optionsToSend.length > 0) {
        const invalidOptions = optionsToSend.filter(
          (opt) => !opt.options_id || !opt.qty || parseInt(opt.qty, 10) < 1
        );
        if (invalidOptions.length > 0) {
          enqueueSnackbar(
            "Please enter a valid quantity for all selected options",
            { variant: "error" }
          );
          return;
        }

        optionsToSend.forEach((option, index) => {
          formData.append(
            `booking_options[${index}][option_id]`,
            option.options_id
          );
          formData.append(`booking_options[${index}][qty]`, option.qty);
        });
      }

      // Security: Only log FormData in development mode
      if (import.meta.env.DEV) {
        console.log("FormData keys and values:");
        for (const [key, value] of formData.entries()) {
          console.log(`${key}:`, value);
        }
      }

      const res = await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/reservation/${id}/update`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Note: Don't set Content-Type for FormData - let axios set it with boundary
            Accept: "application/json",
            "Accept-Language": "en",
            lang: "en",
          },
        }
      );

      // Security: Only log response in development mode
      if (import.meta.env.DEV) {
        console.log("API Response:", res.data);
      }

      // Check for errors in response even if success is true
      const hasError =
        res.data?.data?.error ||
        (res.data?.message &&
          (res.data.message.toLowerCase().includes("wrong") ||
            res.data.message.toLowerCase().includes("error") ||
            res.data.message.toLowerCase().includes("failed")));

      if (res.data?.success && !hasError) {
        enqueueSnackbar(
          res.data?.message || "Arrival date updated successfully!",
          { variant: "success" }
        );
        setIsDateModalOpen(false);
        fetchReservation(); // Refresh reservation data
      } else {
        // Show error message from data.error if available, otherwise use message
        const errorMsg =
          res.data?.data?.error ||
          res.data?.message ||
          "Failed to update arrival date";
        enqueueSnackbar(errorMsg, { variant: "error" });
      }
    } catch (error) {
      // Security: Don't expose detailed error info in production
      const errorMessage = import.meta.env.DEV
        ? `Error updating arrival date: ${error.message || "Unknown error"}`
        : "An error occurred while updating arrival date.";
      console.error(errorMessage);
      if (import.meta.env.DEV && error.response) {
        console.error("Error response:", error.response.data);
      }

      // Sanitize error message for user display
      const userErrorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "An error occurred while updating arrival date.";
      enqueueSnackbar(userErrorMessage, { variant: "error" });
    }
  };

  if (!reservationData) {
    return <LoadingSpinner />;
  }

  // Helper function to normalize status for comparison
  const normalizeStatus = (status) => {
    if (!status) return "";
    return String(status).trim().toUpperCase();
  };

  // Check both status and status_name fields, case-insensitive
  const currentStatus = normalizeStatus(
    reservationData.status || reservationData.status_name
  );

  const canEditArrivalDate =
    currentStatus === "WAITING CONFIRMATION" ||
    currentStatus === "WAITING CONFIRMATION FROM CUSTOMER" ||
    currentStatus === "NEW ARRIVAL DATE AWAITS YOUR APPROVAL";

  // Debug logging in development mode
  if (import.meta.env.DEV) {
    console.log("Reservation status check:", {
      status: reservationData.status,
      status_name: reservationData.status_name,
      normalized: currentStatus,
      canEditArrivalDate,
    });
  }

  return (
    <>
      {/* <h2 className="text-lg card-title mb-4">#{id}</h2> */}

      <div className="card shadow-sm">
        <div className="card-header">
          <div className="flex flex-col  ">
            <p>Offer</p>
            <h3 className="card-title">{reservationData.offer_title}</h3>
          </div>
          <span
            className={`badge badge-outline ${
              currentStatus === "ACTIVE" ||
              currentStatus === "COMPLETED" ||
              currentStatus === "CONFIRMED"
                ? "badge-success"
                : currentStatus === "INACTIVE" || currentStatus === "CANCELED"
                  ? "badge-danger"
                  : currentStatus === "WAITING PAYMENT"
                    ? "badge-primary"
                    : currentStatus === "WAITING CONFIRMATION"
                      ? "badge-warning"
                      : currentStatus === "WAITING CONFIRMATION FROM CUSTOMER"
                        ? "badge-warning"
                        : currentStatus ===
                            "NEW ARRIVAL DATE AWAITS YOUR APPROVAL"
                          ? "badge-warning"
                          : "badge-secondary"
            }`}
          >
            {reservationData.status || reservationData.status_name}
          </span>
        </div>
        {/* Status badge */}

        {/* Offer Title */}

        {/* Provider Info */}
        <div className=" card-body  ">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <img
              src={
                reservationData.person_image ||
                toAbsoluteUrl("/media/avatars/blank.png")
              }
              alt={reservationData.person_name}
              onError={(e) => {
                e.target.src = toAbsoluteUrl("/media/avatars/blank.png");
                e.target.onerror = null;
              }}
              className="w-14 h-14 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <h3 className="card-title items-center flex gap-2 mb-1">
                {reservationData.person_name}{" "}
                <span
                  className={`badge badge-sm badge-outline ${reservationData.provider?.[0]?.status === "active" ? "badge-success" : reservationData.provider?.[0]?.status === "inactive" ? "badge-danger" : reservationData.provider?.[0]?.status === "Waiting Confirmation" ? "badge-warning" : "badge-secondary"}`}
                >
                  {reservationData.provider?.[0]?.status}
                </span>{" "}
              </h3>
              <span className="text-md flex justify-center items-center gap-2 text-gray-500">
                <KeenIcon icon="phone" className=" h-4" aria-hidden="true" />{" "}
                <span className="flex justify-center items-center ">
                  {reservationData.person_phone}
                </span>
                <KeenIcon icon="sms" className=" h-4" aria-hidden="true" />{" "}
                <span className="flex justify-center items-center ">
                  {reservationData.person_email}
                </span>
              </span>
            </div>
          </div>
          <div className="flex flex-wrap mt-4 gap-4 text-start">
            <div className="border-2 border-dashed p-3 rounded-lg min-w-[120px]">
              <div className="font-semibold">{reservationData.sp_name}</div>
              <div className="text-md text-gray-500 font-light">Bussiness</div>
            </div>

            <div className="border-2 border-dashed p-3 rounded-lg min-w-[120px]">
              <div className="font-semibold">{reservationData.num_coupons}</div>
              <div className="text-md text-gray-500 font-light">
                Coupon Quantity
              </div>
            </div>

            <div className="border-2 border-dashed p-3 rounded-lg min-w-[120px]">
              <div className="font-semibold">{reservationData.offer_price}</div>
              <div className="text-md text-gray-500 font-light">Price</div>
            </div>

            <div className="border-2 border-dashed p-3 rounded-lg min-w-[120px]">
              <div className="font-semibold">{reservationData.expired_at}</div>
              <div className="text-md text-gray-500 font-light">
                Coupon Valid Until
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3 className="card-title text-lg my-4">Reservation Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card shadow-sm">
          <div className="card-header">
            <h3 className="card-title">Payment Summary</h3>
          </div>
          <div className="card-body">
            <div className="flex w-full items-center justify-between gap-2 mb-2">
              <label htmlFor="booking-status-select" className="text-md">
                Status
              </label>
              <select
                id="booking-status-select"
                className="select select-bordered select-sm max-w-xs"
                value={bookingStatus || reservationData.status_num}
                onChange={(e) => setBookingStatus(e.target.value)}
                aria-label="Booking status"
              >
                <option value="1">Active</option>
                <option value="2">Completed</option>
                <option value="3">Cancelation</option>
                <option value="4">Waiting Payment</option>
                <option value="5">Waiting Confirmation</option>
                <option value="6">Waiting Approve From Customer</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex w-full justify-between gap-2">
                <div className="text-md">Coupons</div>
                <div className="font-semibold">
                  {reservationData.num_coupons} x {reservationData.offer_price}
                </div>
              </div>
              <div className="flex w-full justify-between gap-2">
                <div className="text-md">Subtotal</div>
                <div className="font-semibold">
                  {reservationData.offer_price * reservationData.num_coupons}
                </div>
              </div>
              <div className="flex w-full justify-between gap-2">
                <div className="text-md">Troving Commission</div>
                <div className="font-semibold">
                  {reservationData.commission_percentage}
                </div>
              </div>
              <div className="flex w-full justify-between gap-2">
                <div className="text-md">Total Payment</div>
                <div className="font-semibold">
                  {(() => {
                    const subtotal =
                      reservationData.offer_price * reservationData.num_coupons;
                    const commissionPercent =
                      parseFloat(
                        reservationData.commission_percentage.replace("%", "")
                      ) / 100;
                    const commissionAmount = subtotal * commissionPercent;
                    const totalPayment = subtotal - commissionAmount;
                    return totalPayment.toFixed(2); // 2 decimal places
                  })()}
                </div>
              </div>
              {/* Paid status control */}
              {currentStatus === "WAITING PAYMENT" && (
                <div className="flex w-full justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-md">Paid Status</span>
                    <select
                      className="select select-sm border-gray-300"
                      value={paidStatus}
                      onChange={(e) => setPaidStatus(e.target.value)}
                      aria-label="Paid Status"
                    >
                      <option value="0">Failed</option>
                      <option value="1">Success</option>
                      <option value="2">No Paid</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card shadow-sm">
          <div className="card-header">
            <h3 className="card-title">Arrival Date</h3>
          </div>
          <div className="card-body">
            <div className="card p-4">
              <div className="flex items-center gap-4">
                <div className="relative size-[50px] shrink-0">
                  <svg
                    className="w-full h-full stroke-primary-clarity "
                    viewBox="0 0 44 48"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M16 2.4641C19.7128 0.320509 24.2872 0.320508 28 2.4641L37.6506 8.0359C41.3634 10.1795 43.6506 14.141 43.6506
                          18.4282V29.5718C43.6506 33.859 41.3634 37.8205 37.6506 39.9641L28 45.5359C24.2872 47.6795 19.7128 47.6795 16 45.5359L6.34937
                          39.9641C2.63655 37.8205 0.349365 33.859 0.349365 29.5718V18.4282C0.349365 14.141 2.63655 10.1795 6.34937 8.0359L16 2.4641Z"
                    />
                    <path
                      d="M16.25 2.89711C19.8081 0.842838 24.1919 0.842837 27.75 2.89711L37.4006 8.46891C40.9587 10.5232 43.1506
                          14.3196 43.1506 18.4282V29.5718C43.1506 33.6804 40.9587 37.4768 37.4006 39.5311L27.75 45.1029C24.1919
                          47.1572 19.8081 47.1572 16.25 45.1029L6.59937 39.5311C3.04125 37.4768 0.849365 33.6803 0.849365 29.5718V18.4282C0.849365
                          14.3196 3.04125 10.5232 6.59937 8.46891L16.25 2.89711Z"
                      stroke="#5C5E9B"
                      strokeOpacity="0.2"
                    />
                  </svg>

                  <div
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                    aria-hidden="true"
                  >
                    <KeenIcon
                      icon="calendar"
                      className=" flex justify-center items-center text-[24px] text-[#5C5E9B]"
                    />
                  </div>
                </div>
                <h3 className="card-title">
                  {reservationData.booking_date
                    ? new Date(reservationData.booking_date).toLocaleDateString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "-"}
                </h3>
              </div>
              <button
                className={`btn btn-outline ${
                  canEditArrivalDate ? "btn-warning" : "btn-success"
                } flex justify-center items-center mt-4 border`}
                onClick={() => {
                  if (canEditArrivalDate) {
                    setIsDateModalOpen(true);
                  }
                }}
                aria-label={
                  canEditArrivalDate
                    ? "Edit Arrival Date"
                    : "Arrival Date Confirmed"
                }
              >
                {canEditArrivalDate ? "Edit Arrival Date" : "Confirmed"}
              </button>
            </div>
          </div>
        </div>

        {/* Booking Status control - shown when status is waiting confirmation, but available for general use */}
        {/* <div className="card shadow-sm ">
          <div className="card-header">
            <h3 className="card-title">Booking Status</h3>
          </div>
          <div className="card-body "></div>
        </div> */}
      </div>

      {/* Selected Options Display */}
      {offerData?.options &&
        offerData.options.length > 0 &&
        selectedOptions.length > 0 && (
          <div className="card mt-6 shadow-sm">
            <div className="card-header">
              <h3 className="card-title">Selected Options</h3>
            </div>
            <div className="card-body">
              <div className="space-y-3">
                {selectedOptions.map((selectedOpt) => {
                  const optionDetails = offerData.options.find(
                    (opt) => opt.id.toString() === selectedOpt.options_id
                  );
                  if (!optionDetails) return null;

                  return (
                    <div
                      key={selectedOpt.options_id}
                      className="flex items-center gap-4 p-3 border rounded-md"
                    >
                      <div className="flex-1 flex items-center gap-4">
                        <img
                          src={
                            optionDetails.images?.[0]?.image ||
                            toAbsoluteUrl("/media/avatars/blank.png")
                          }
                          alt={optionDetails.name}
                          className="w-20 h-20 object-cover square rounded-sm"
                        />
                        <div>
                          <div className="font-semibold">
                            {optionDetails.name}
                          </div>
                          {optionDetails.description && (
                            <div className="text-sm text-gray-600">
                              {optionDetails.description}
                            </div>
                          )}
                        </div>
                      </div>
                      {/* <div className="flex-1">
                        <div className="font-semibold">
                          {optionDetails.name}
                        </div>
                        {optionDetails.description && (
                          <div className="text-sm text-gray-600">
                            {optionDetails.description}
                          </div>
                        )}
                        <div className="text-sm text-gray-500">
                          Price: {optionDetails.price}{" "}
                          {offerData?.currency ||
                            offerData?.currency_name ||
                            "EGP"}{" "}
                          x {selectedOpt.qty}
                        </div>
                      </div> */}
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Quantity</div>
                        <div className="font-semibold">{selectedOpt.qty}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          Total:{" "}
                          {parseInt(optionDetails.price) *
                            parseInt(selectedOpt.qty || 0)}{" "}
                          {offerData?.currency ||
                            offerData?.currency_name ||
                            "EGP"}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Allow editing options if status allows */}
                {canEditArrivalDate && (
                  <div className="mt-4 border-t pt-4">
                    <label className="form-label mb-2">Edit Options</label>
                    <div className="border rounded-lg p-4 space-y-3">
                      {offerData.options.map((option) => {
                        const selectedOption = selectedOptions.find(
                          (opt) => opt.options_id === option.id.toString()
                        );
                        const isSelected = !!selectedOption;

                        return (
                          <div
                            key={option.id}
                            className="flex items-center gap-4 p-3 border rounded-md"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                const subset = selectedOptions.filter(
                                  (opt) =>
                                    opt.options_id !== option.id.toString()
                                );
                                if (e.target.checked) {
                                  setSelectedOptions([
                                    ...subset,
                                    {
                                      options_id: option.id.toString(),
                                      qty: "1",
                                    },
                                  ]);
                                } else {
                                  setSelectedOptions(subset);
                                }
                              }}
                              className="checkbox checkbox-primary"
                            />
                            <div className="flex-1">
                              <div className="font-semibold">{option.name}</div>
                              {option.description && (
                                <div className="text-sm text-gray-600">
                                  {option.description}
                                </div>
                              )}
                              <div className="text-sm text-gray-500">
                                Price: {option.price}{" "}
                                {offerData?.currency ||
                                  offerData?.currency_name ||
                                  "EGP"}
                              </div>
                              <div className="text-sm text-gray-500">
                                Available: {option.qty}
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
                                    // Sanitize input: only allow positive integers
                                    const value = e.target.value.replace(
                                      /[^0-9]/g,
                                      ""
                                    );
                                    const numValue = parseInt(value, 10);
                                    const sanitizedValue =
                                      value === ""
                                        ? ""
                                        : numValue > 0
                                          ? String(numValue)
                                          : "1";

                                    const updatedOptions = selectedOptions.map(
                                      (opt) =>
                                        opt.options_id === option.id.toString()
                                          ? { ...opt, qty: sanitizedValue }
                                          : opt
                                    );
                                    setSelectedOptions(updatedOptions);
                                  }}
                                  onBlur={() => {
                                    const currentOption = selectedOptions.find(
                                      (opt) =>
                                        opt.options_id === option.id.toString()
                                    );
                                    if (
                                      currentOption &&
                                      (!currentOption.qty ||
                                        parseInt(currentOption.qty) < 1)
                                    ) {
                                      const updatedOptions =
                                        selectedOptions.map((opt) =>
                                          opt.options_id ===
                                          option.id.toString()
                                            ? { ...opt, qty: "1" }
                                            : opt
                                        );
                                      setSelectedOptions(updatedOptions);
                                    }
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      <div className="card mt-6 shadow-sm">
        <div className="card-header">
          <h3 className="card-title">Coupons</h3>
          <h3 className="card-title">
            {(() => {
              // Flatten all coupons from all booking_options
              const allCoupons =
                reservationData.booking_options?.flatMap(
                  (bo) => bo.coupons || []
                ) || [];
              const usedCount = allCoupons.filter(
                (coupon) => coupon.is_used === "1" || coupon.is_used === 1
              ).length;
              return `${usedCount}/${reservationData.num_coupons}`;
            })()}
          </h3>
        </div>
        <div className="card-body">
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-1 gap-2">
              {(() => {
                // Flatten all coupons from all booking_options
                const allCoupons =
                  reservationData.booking_options?.flatMap(
                    (bo) => bo.coupons || []
                  ) || [];
                return allCoupons.length > 0 ? (
                  allCoupons.map((coupon, index) => (
                    <div
                      key={index}
                      className="flex justify-between w-full items-center"
                    >
                      <div className="flex flex-col">
                        <p className="text-md text-gray-600 ">
                          Day of Use {coupon.day_of_use}{" "}
                        </p>
                        <p className="font-semibold">{coupon.coupon}</p>
                      </div>
                      {coupon.is_used === "1" || coupon.is_used === 1 ? (
                        <KeenIcon
                          icon="check-circle"
                          className="text-success text-xl"
                          aria-label="Coupon used"
                        />
                      ) : null}
                    </div>
                  ))
                ) : (
                  <p>There Are No Coupons Used</p>
                );
              })()}
              {(() => {
                // Flatten all coupons from all booking_options
                const allCoupons =
                  reservationData.booking_options?.flatMap(
                    (bo) => bo.coupons || []
                  ) || [];
                const hasUnusedCoupons = allCoupons.some(
                  (coupon) => coupon.is_used !== "1" && coupon.is_used !== 1
                );
                return currentStatus === "ACTIVE" && hasUnusedCoupons ? (
                  <button
                    className="btn btn-outline btn-primary flex w-full justify-center mt-4"
                    onClick={() => setIsModalOpen(true)}
                  >
                    Use Coupon
                  </button>
                ) : null;
              })()}
            </div>
          </div>
        </div>
        <div className="card-footer py-6 flex justify-end gap-4">
          <button
            className="px-6 py-2 rounded-md  font-medium btn btn-outline btn-danger"
            type="button"
          >
            Cancel Reservation
          </button>
          <button
            className="px-6 py-2 rounded-md text-white font-medium btn btn-outline btn-primary"
            type="button"
            onClick={() =>
              handleDateChange(
                parseInt(bookingStatus || reservationData.status_num, 10)
              )
            }
          >
            Update Reservation
          </button>
        </div>
      </div>

      {/* Add Coupon Modal */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div
          className="card  w-1/2 h-auto justify-center gap-4 z-[9999]"
          style={{ margin: "auto", maxWidth: "500px" }}
        >
          <div className="card-header">
            <h2 className="card-title">Add Coupon</h2>
            <button
              onClick={() => setIsModalOpen(false)}
              aria-label="Close add coupon modal"
            >
              <KeenIcon
                icon="cross-circle"
                className="text-xl"
                aria-hidden="true"
              />{" "}
            </button>
          </div>
          <div className="card-body ">
            {couponCodes.map((code, index) => (
              <div
                key={index}
                className={`form-control ${index > 0 ? "mt-4" : ""}`}
              >
                <label className="label">
                  <span className="label-text">Coupon {index + 1}</span>
                </label>
                <input
                  type="number"
                  placeholder={`Enter coupon number ${index + 1} like 9552652`}
                  className="input  w-full"
                  value={code}
                  onChange={(e) => {
                    // Sanitize input: trim whitespace and remove any potentially dangerous characters
                    const sanitizedValue = e.target.value
                      .trim()
                      .replace(/[<>"'&]/g, "");
                    const newCouponCodes = [...couponCodes];
                    newCouponCodes[index] = sanitizedValue;
                    setCouponCodes(newCouponCodes);
                  }}
                />
              </div>
            ))}
          </div>
          <div className="card-footer justify-end gap-4">
            <button
              className="btn border-1 border-gray-100 bg-transparent btn-secondary hover:border-0"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-outline btn-primary"
              onClick={handleAddCoupons}
            >
              Confirm
            </button>
          </div>
        </div>
      </Modal>
      {/* Add Date Edit Modal */}
      <Modal open={isDateModalOpen} onClose={() => setIsDateModalOpen(false)}>
        <div
          className="card w-1/2 h-1/2 items-center justify-center gap-4 relative "
          style={{ margin: "auto", maxWidth: "500px" }}
        >
          <div className="card-header w-full">
            <h2 className="card-title">Edit Arrival Date</h2>
            <button
              onClick={() => setIsDateModalOpen(false)}
              aria-label="Close edit arrival date modal"
            >
              <KeenIcon
                icon="cross-circle"
                className="text-xl"
                aria-hidden="true"
              />
            </button>
          </div>
          <div className="card-body w-full h-full items-center justify-center ">
            <div className="form-control relative">
              <label className="label">
                <span className="label-text">Select New Arrival Date</span>
              </label>
              <FlowbiteHtmlDatepicker
                // className="z-[9999]" // If supported
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>
          </div>
          <div className="card-footer justify-end w-full gap-4">
            <button
              className="btn border-1 border-gray-100 bg-transparent btn-secondary hover:border-0"
              onClick={() => setIsDateModalOpen(false)}
            >
              Cancel
            </button>
            <button
              className="btn btn-outline btn-primary"
              onClick={() => handleDateChange(6)}
            >
              Update Date
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export { ReservationDefaultContent };
