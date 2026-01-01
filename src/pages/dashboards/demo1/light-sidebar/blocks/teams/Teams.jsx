import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { DataGrid, KeenIcon } from "@/components";
import { useNavigate } from "react-router-dom";
import { DateRangeFilter } from "@/components";
import { toAbsoluteUrl } from "@/utils";

// Allowed sort fields as per API specification
const ALLOWED_SORTS = [
  "booking_uid",
  "booking_status",
  "offer_qty",
  "booking_add_date",
  "offer.offer_price",
];

// Map column IDs/accessorKeys to API sort field names
const COLUMN_TO_SORT_MAP = {
  id: "booking_uid", // column id 'id' maps to booking_uid
  booking_uid: "booking_uid",
  status_name: "booking_status",
  num_coupons: "offer_qty",
  order_date: "booking_add_date",
  offer_price: "offer.offer_price",
};

const Teams = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [searchStatus, setSearchStatus] = useState("");
  const [triggerFetch, setTriggerFetch] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400); // debounce delay

    return () => clearTimeout(delayDebounce);
  }, [search]);

  const columns = useMemo(
    () => [
      {
        id: "id",
        header: "ID",
        accessorKey: "booking_uid",
        enableSorting: true, // Maps to booking_uid
        cell: ({ row }) => (
          <div className="text-sm font-medium">{row.original.booking_uid}</div>
        ),
        meta: { className: "max-w-[100px]" },
      },
      {
        enableSorting: false, // No mapping available
        header: "Person",
        accessorKey: "person_name",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <img
              loading="lazy"
              src={
                row.original.person_image ||
                toAbsoluteUrl("/media/avatars/blank.png")
              }
              alt={row.original.person_name}
              className="w-8 h-8 rounded-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = toAbsoluteUrl("/media/avatars/blank.png");
              }}
            />
            <span className="font-medium">{row.original.person_name}</span>
          </div>
        ),
        meta: { className: "max-w-[50px]" },
      },
      {
        enableSorting: false, // No mapping available
        header: "Offer Title",
        accessorKey: "offer_title",
        meta: { className: " min-w-[100px] max-w-[100px]" },
      },
      {
        enableSorting: true, // Maps to offer_qty
        header: "Quantity",
        accessorKey: "num_coupons",
        meta: { className: " min-w-[100px] max-w-[100px]" },
      },
      {
        enableSorting: true, // Maps to offer.offer_price
        header: "Price",
        accessorKey: "offer_price",
        meta: { className: " min-w-[100px] max-w-[100px]" },
      },
      {
        enableSorting: true, // Maps to booking_add_date
        header: "Reservation Date",
        accessorKey: "order_date",
        cell: ({ getValue }) => {
          const date = new Date(getValue());
          return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        },
        meta: { className: " min-w-[150px] max-w-[150px]" },
      },
      {
        enableSorting: true, // Maps to booking_status
        header: "Status",
        accessorKey: "status_name",
        cell: ({ row }) => {
          const statusName = row.original.status_name;
          const getStatusBadge = () => {
            switch (statusName) {
              case "ACTIVE":
                return (
                  <span className="badge badge-success badge-outline">
                    {statusName}
                  </span>
                );
              case "COMPLETED":
                return (
                  <span className="badge badge-primary badge-outline">
                    {statusName}
                  </span>
                );
              case "CANCELED":
                return (
                  <span className="badge badge-danger badge-outline">
                    {statusName}
                  </span>
                );
              case "WAITING PAYMENT":
                return (
                  <span className="badge badge-info  badge-outline">
                    {statusName}
                  </span>
                );
              case "WAITING CONFIRMATION":
                return (
                  <span className="badge badge-warning badge-outline">
                    {statusName}
                  </span>
                );
              case "WAITING APPROVE FROM CUSTOMER":
                return (
                  <span className="badge badge-secondary badge-outline">
                    {statusName}
                  </span>
                );
              default:
                return (
                  <span className="badge badge-warning badge-outline">
                    {statusName}
                  </span>
                );
            }
          };

          return statusName ? getStatusBadge() : "";
        },
        meta: { className: "min-w-[100px] max-w-[100px]" },
      },
      {
        header: "",
        id: "actions",
        cell: ({ row }) => (
          <button
            className="px-2 btn btn-sm py-1"
            onClick={() =>
              navigate(`/reservationprofile/${row.original.booking_uid}`, {
                state: { reservation: row.original },
              })
            }
            aria-label={`Edit reservation ${row.original.booking_uid}`}
            title="Edit reservation"
          >
            <i className="ki-filled ki-notepad-edit" aria-hidden="true"></i>
          </button>
        ),
      },
    ],
    []
  );

  const fetchBookings = async ({ pageIndex, pageSize, sorting }) => {
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
        return { data: [], totalCount: 0 };
      }

      // Map column sort ID to API sort field
      let sortKey = "-booking_uid"; // Default sort
      let sortDir = ""; // Default ascending

      // If date filters are applied, sort by highest/latest booking ID (descending)
      const hasDateFilter = fromDate || toDate;

      if (sorting?.[0]) {
        // User manually sorted by clicking column header
        const columnId = sorting[0].id;
        // Map column ID/accessorKey to API sort field
        const mappedSort = COLUMN_TO_SORT_MAP[columnId];

        if (mappedSort && ALLOWED_SORTS.includes(mappedSort)) {
          sortKey = mappedSort;
          sortDir = sorting[0].desc ? "-" : "";
        }
      } else if (hasDateFilter) {
        // Auto-sort by highest/latest booking ID when date filter is active
        sortKey = "booking_uid";
        sortDir = "-"; // Descending (highest/latest ID first)
      }

      const baseFilters = [
        fromDate ? `&filter[from_booking_date]=${fromDate}` : "",
        toDate ? `&filter[to_booking_date]=${toDate}` : "",
        searchStatus
          ? `&filter[booking_status]=${encodeURIComponent(searchStatus)}`
          : "",
      ].join("");

      const baseUrl = `${import.meta.env.VITE_APP_API_URL}/reservations/list?sort=${sortDir}${sortKey}&perPage=${pageSize}&page=${pageIndex + 1}${baseFilters}`;

      let url = baseUrl;

      if (debouncedSearch) {
        const isBookingUid =
          debouncedSearch.startsWith("RES") || /^\d+$/.test(debouncedSearch);
        if (isBookingUid) {
          url += `&filter[booking_uid]=${debouncedSearch}`;
        } else {
          url += `&filter[offer_title]=${debouncedSearch}`;
        }
      }

      // First API try
      let response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let bookings = response?.data?.data ?? [];
      let total = response?.data?.pagination?.total ?? 0;

      // Smart Retry Logic:
      if (debouncedSearch && !bookings.length) {
        let retryUrl = baseUrl + `&filter[person_name]=${debouncedSearch}`;

        const retryResponse = await axios.get(retryUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        bookings = retryResponse?.data?.data ?? [];
        total = retryResponse?.data?.pagination?.total ?? 0;
      }

      setTotalCount(total);
      return { data: bookings, totalCount: total };
    } catch (err) {
      console.error("❌ Error fetching bookings:", err);
      return { data: [], totalCount: 0 };
    } finally {
      setLoading(false);
    }
  };

  // Trigger refetch on filter change
  useEffect(() => {
    setTriggerFetch((prev) => prev + 1);
  }, [fromDate, toDate, searchStatus, debouncedSearch]);

  return (
    <div className="card card-grid min-w-full">
      <div className="card-header flex-wrap gap-2">
        <h3 className="card-title font-medium text-sm">
          Showing {totalCount} Reservation
        </h3>
        <div className="flex gap-2">
          <div className="custom-datepicker-wrapper ">
            <DateRangeFilter
              onChange={({ from, to }) => {
                setFromDate(from || "");
                setToDate(to || "");
              }}
            />
          </div>
          <label className="input input-sm w-60 h-10">
            <KeenIcon icon="magnifier" />
            <input
              type="text"
              placeholder="Search by Name , id or Title"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <select
            className="select select-md"
            value={searchStatus}
            onChange={(e) => setSearchStatus(e.target.value)}
            aria-label="Filter reservations by status"
            title="Filter by status"
          >
            <option value="">Status</option>
            <option value="1">Active</option>
            <option value="2">Completed</option>
            <option value="3">Cancelled</option>
            <option value="4">Waiting Payment</option>
            <option value="5">Waiting Confirmation</option>
          </select>
        </div>
      </div>

      <div className="card-body">
        <DataGrid
          columns={columns}
          serverSide
          onFetchData={fetchBookings}
          key={triggerFetch}
          isLoading={loading}
          pagination={{
            page: 0,
            size: 5,
          }}
        />
      </div>
    </div>
  );
};

export { Teams };
