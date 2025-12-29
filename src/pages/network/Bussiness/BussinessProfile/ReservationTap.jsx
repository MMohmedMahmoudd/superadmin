import { useMemo, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { DataGrid, KeenIcon, DateRangeFilter } from "@/components";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { toAbsoluteUrl } from "@/utils";
const ReservationTap = ({ providerId }) => {
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [refetchKey, setRefetchKey] = useState(0);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPageIndex(0);
      setRefetchKey((prev) => prev + 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setRefetchKey((prev) => prev + 1);
  }, [debouncedSearch, fromDate, toDate, statusFilter]);

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
      const baseUrl =
        `${import.meta.env.VITE_APP_API_URL}/reservations/list` +
        `?perPage=${pageSize}&page=${pageIndex + 1}` +
        (sort ? `&sort=${sort}` : "") +
        `&filter[sp_uid]=${providerId}`;

      let url = baseUrl;

      if (debouncedSearch) {
        const isBookingUid = debouncedSearch.startsWith("RES");
        const isPhoneNumber = /^\d{8,}$/.test(debouncedSearch);
        const isPureNumber = /^\d+$/.test(debouncedSearch);

        if (isBookingUid) {
          url += `&filter[booking_uid]=${debouncedSearch}`;
        } else if (isPhoneNumber) {
          url += `&filter[person_phone]=${debouncedSearch}`;
        } else if (isPureNumber) {
          url += `&filter[booking_uid]=${debouncedSearch}`;
        } else {
          url += `&filter[offer_title]=${debouncedSearch}`;
        }
      }

      if (fromDate) url += `&filter[from_booking_date]=${fromDate}`;
      if (toDate) url += `&filter[to_booking_date]=${toDate}`;
      if (statusFilter) url += `&filter[booking_status]=${statusFilter}`;

      let res = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      let data = res.data?.data ?? [];
      let total = res.data?.pagination?.total ?? 0;

      // Smart switch: If no results and debouncedSearch exists
      if (debouncedSearch && !data.length) {
        // Retry using person_name
        let retryUrl = baseUrl + `&filter[person_name]=${debouncedSearch}`;

        if (fromDate) retryUrl += `&filter[from_booking_date]=${fromDate}`;
        if (toDate) retryUrl += `&filter[to_booking_date]=${toDate}`;
        if (statusFilter) retryUrl += `&filter[booking_status]=${statusFilter}`;

        const retryRes = await axios.get(retryUrl, {
          headers: { Authorization: `Bearer ${token}` },
        });

        data = retryRes.data?.data ?? [];
        total = retryRes.data?.pagination?.total ?? 0;
      }

      setTotalCount(total);
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

  const mapStatus = useCallback((status) => {
    const map = {
      ["waiting payment"]: "primary",
      ["confirmed"]: "success",
      ["completed"]: "success",
      ["active"]: "success",
      ["cancelled"]: "danger",
      ["expired"]: "danger",
    };
    return map[status?.toLowerCase()] || "warning";
  }, []);

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
        id: "offer.offer_price",
        header: "Offer",
        accessorKey: "offer.offer_price",
        cell: ({ row }) => (
          <div className="text-sm">
            <strong>{row.original.offer_title}</strong>
          </div>
        ),
        meta: { className: "min-w-[360px]" },
        enableSorting: true,
      },
      {
        id: "person_name",
        header: "Customer",
        accessorKey: "person_name",
        cell: ({ row }) => {
          const { person_name, person_image, person_phone } = row.original;
          return (
            <>
              <div className="flex items-center gap-3">
                <img
                  src={
                    person_image || toAbsoluteUrl("/media/avatars/blank.png")
                  }
                  alt={person_name}
                  className="w-9 h-9 rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = toAbsoluteUrl("/media/avatars/blank.png");
                  }}
                />
                <div className="flex flex-col items-center  ">
                  <div className="text-sm font-medium">{person_name}</div>
                  <div className="text-sm font-medium">{person_phone}</div>
                </div>
              </div>
            </>
          );
        },
        meta: { className: "min-w-[220px]" },
      },
      {
        id: "order_date",
        header: "Order Date",
        accessorKey: "order_date",
        cell: ({ row }) => {
          const date = new Date(row.original.order_date);
          return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        },
        enableSorting: true,
        meta: { className: "min-w-[150px]" },
      },
      {
        id: "booking_add_date",
        header: "booking date",
        accessorKey: "booking_add_date",
        cell: ({ row }) => {
          const date = new Date(row.original.booking_date);
          return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        },
        enableSorting: true,
        meta: { className: "min-w-[150px]" },
      },
      {
        id: "coupons.expired_at",
        header: "Expires At",
        accessorKey: "coupons.expired_at",
        cell: ({ row }) => {
          if (!row.original.expired_at) return "-";
          const date = new Date(row.original.expired_at);
          return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        },
        enableSorting: true,
        meta: { className: "min-w-[150px]" },
      },
      {
        id: "offer.offer_price",
        header: "Offer Price",
        accessorKey: "offer.offer_price",
        enableSorting: true,
        cell: ({ row }) => (
          <span className="text-sm">{row.original.offer_price}</span>
        ),
        meta: { className: "min-w-[150px]" },
      },
      {
        id: "coupons",
        header: "Coupons",
        accessorKey: "num_coupons",
        cell: ({ row }) => (
          <span className="text-sm">{row.original.num_coupons}</span>
        ),
        meta: { className: "min-w-[100px]" },
        enableSorting: true,
      },
      {
        id: "booking_status",
        header: "Status",
        accessorKey: "booking_status",
        cell: ({ row }) => (
          <span
            className={`badge badge-${mapStatus(row.original.status_name)} badge-outline capitalize w-full text-center`}
          >
            {row.original.status_name}
          </span>
        ),
        meta: { className: "min-w-[150px]" },
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
              navigate(`/reservationprofile/${row.original.booking_uid}`)
            }
          >
            <i className="ki-filled ki-notepad-edit"></i>
          </button>
        ),
      },
    ],
    []
  );

  return (
    <div className="card p-3 pt-0">
      <div className="card-body p-0 overflow-x-auto relative">
        <div className="card-header px-2 flex-wrap gap-2 justify-between">
          <h3 className="card-title ">Showing {totalCount} Reservations</h3>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="input input-sm w-72 h-9 hover:text-primary">
              <KeenIcon
                icon="magnifier"
                className="hover:text-primary text-gray-500 "
              />
              <input
                type="text"
                placeholder="Search by Customer Name"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>

            <DateRangeFilter
              onChange={({ from, to }) => {
                setFromDate(from || "");
                setToDate(to || "");
              }}
            />
            <select
              className="select select-sm w-32"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPageIndex(0);
                setRefetchKey((prev) => prev + 1);
              }}
            >
              <option value="">All Status</option>
              <option value="1">Active</option>
              <option value="2">Completed</option>
              <option value="3">Cancelation</option>
              <option value="4">Waiting Payment</option>
              <option value="5">Waiting Confirmation</option>
              <option value="6">Waiting Approve From Customer</option>
            </select>
            <button
              className="btn btn-sm btn-outline btn-primary"
              onClick={() => navigate("/addreservation")}
            >
              Add New Reservation
            </button>
          </div>
        </div>
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
    </div>
  );
};

ReservationTap.propTypes = {
  providerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};

export { ReservationTap };
