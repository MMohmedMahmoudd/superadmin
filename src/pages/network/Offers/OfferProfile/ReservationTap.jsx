import { useMemo, useState } from "react";
import axios from "axios";
import { DataGrid } from "@/components";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { toAbsoluteUrl } from "@/utils";
const ReservationTap = ({ offerId }) => {
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [refetchKey] = useState(0);
  const [currency, setCurrency] = useState("EGP"); // Default currency
  const navigate = useNavigate();
  const fetchReservations = async ({ pageIndex, pageSize, sorting }) => {
    try {
      setLoading(true);
      const token = JSON.parse(
        localStorage.getItem(
          import.meta.env.VITE_APP_NAME +
            "-auth-v" +
            import.meta.env.VITE_APP_VERSION
        )
      )?.access_token;

      const sort = sorting?.[0]?.id;
      const url =
        `${import.meta.env.VITE_APP_API_URL}/reservations/list` +
        `?perPage=${pageSize}&page=${pageIndex + 1}` +
        (sort ? `&sort=${sort}` : "") +
        `&filter[offer_uid]=${offerId}`;

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data?.data ?? [];
      const total = res.data?.pagination?.total ?? 0;

      // Log first reservation to debug fields
      if (data.length > 0) {
        console.log("Sample reservation data:", data[0]);
        console.log("Full API response:", res.data);
      }

      // Check if currency is in the response metadata
      const responseCurrency =
        res.data?.currency || res.data?.currency_name || "EGP";
      setCurrency(responseCurrency);

      return { data, totalCount: total };
    } catch (err) {
      console.error("Error fetching reservations:", err);
      return { data: [], totalCount: 0 };
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  // Helper function to format dates consistently
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Helper function to get status badge color
  const getStatusBadgeColor = (statusName) => {
    const statusMap = {
      "Waiting Payment": "warning",
      confirmed: "success",
      cancelled: "danger",
      expired: "danger",
      completed: "success",
      active: "success",
      inactive: "danger",
      pending: "warning",
      approved: "success",
      rejected: "danger",
    };
    return statusMap[statusName?.toLowerCase()] || "danger";
  };

  const columns = useMemo(
    () => [
      {
        id: "booking_uid",
        header: "ID",
        accessorKey: "booking_uid",
        cell: ({ row }) => (
          <span className="text-sm font-medium">
            {row.original.booking_uid}
          </span>
        ),
        enableSorting: true,
      },
      {
        id: "customer",
        header: "Customer",
        accessorKey: "person_name",
        cell: ({ row }) => {
          const { person_name, person_image } = row.original;
          return (
            <div className="flex items-center gap-3">
              <img
                src={person_image || toAbsoluteUrl("/media/avatars/blank.png")}
                alt={person_name}
                className="w-9 h-9 rounded-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = toAbsoluteUrl("/media/avatars/blank.png");
                }}
              />
              <div className="text-sm font-medium">{person_name}</div>
            </div>
          );
        },
        enableSorting: true,
        meta: { className: "min-w-[180px]" },
      },
      {
        id: "price",
        header: "Price",
        accessorKey: "offer_price",
        cell: ({ row }) => {
          const { offer_price } = row.original;
          // Try multiple possible paths for currency, fall back to state
          const rowCurrency =
            row.original.currency_name ||
            row.original.currency ||
            row.original.offer?.currency_name ||
            row.original.offer?.currency ||
            currency;

          return (
            <span className="text-sm font-medium">
              {offer_price && rowCurrency
                ? `${offer_price} ${rowCurrency}`
                : offer_price || "-"}
            </span>
          );
        },
        enableSorting: true,
        meta: { className: "min-w-[120px]" },
      },
      {
        id: "num_coupons",
        header: "Coupons",
        accessorKey: "num_coupons",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.num_coupons}</span>
        ),
        meta: { className: "min-w-[100px]" },
        enableSorting: true,
      },
      {
        id: "booking_date",
        header: "Reservation Date",
        accessorKey: "booking_date",
        cell: ({ row }) => (
          <span className="text-sm">
            {formatDate(row.original.booking_date)}
          </span>
        ),
        enableSorting: true,
        meta: { className: "min-w-[150px]" },
      },
      {
        id: "order_date",
        header: "Order Date",
        accessorKey: "order_date",
        cell: ({ row }) => (
          <span className="text-sm">{formatDate(row.original.order_date)}</span>
        ),
        enableSorting: true,
        meta: { className: "min-w-[150px]" },
      },
      {
        id: "coupons.expire_date",
        header: "Coupons Expired",
        accessorKey: "coupons.expire_date",
        cell: ({ row }) => {
          const firstCoupon =
            row.original.coupons && row.original.coupons.length > 0
              ? row.original.coupons[0]
              : null;
          return (
            <span className="text-sm">
              {firstCoupon?.expire_date
                ? formatDate(firstCoupon.expire_date)
                : "-"}
            </span>
          );
        },
        enableSorting: true,
        meta: { className: "min-w-[160px]" },
      },
      {
        id: "status",
        header: "Status",
        accessorKey: "status_name",
        cell: ({ row }) => {
          const statusName = row.original.status_name;
          const badgeColor = getStatusBadgeColor(statusName);
          return (
            <span
              className={`badge badge-${badgeColor} badge-outline capitalize`}
            >
              {statusName}
            </span>
          );
        },
        meta: { className: "min-w-[120px]" },
        enableSorting: true,
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <button
            className="px-2 py-1 btn btn-sm text-gray-500"
            onClick={() =>
              navigate(`/reservationprofile/${row.original.booking_uid}`, {
                state: { reservation: row.original },
              })
            }
          >
            <i className="ki-filled ki-notepad-edit"></i>
          </button>
        ),
      },
    ],
    [navigate, currency]
  );

  if (!offerId) return <div>No offer selected.</div>;

  return (
    <div className="card-body p-0 overflow-x-auto relative">
      <DataGrid
        key={refetchKey}
        columns={columns}
        serverSide
        onFetchData={fetchReservations}
        isLoading={loading}
        layout={{
          cellsBorder: true,
          tableSpacing: "sm",
        }}
        pagination={{
          page: pageIndex,
          size: pageSize,
          onPageChange: setPageIndex,
          onPageSizeChange: setPageSize,
        }}
        messages={{
          empty: "No reservations available",
          loading: "Loading reservations...",
        }}
      />
      {loading && (
        <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center">
          <div className="flex items-center gap-2 px-4 py-2 dark:bg-black/50 bg-white/90 rounded-lg shadow-lg">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-gray-700">
              Loading reservations...
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

ReservationTap.propTypes = {
  offerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

export { ReservationTap };
