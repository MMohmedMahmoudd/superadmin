import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { DataGrid, KeenIcon } from "@/components";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { DateRangeFilter } from "@/components";

const OffersTable = ({ providerId }) => {
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [refetchKey, setRefetchKey] = useState(0);
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

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
  }, [debouncedSearch, statusFilter, fromDate, toDate]);

  const fetchOffers = async ({ pageIndex, pageSize, sorting }) => {
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
      let url =
        `${import.meta.env.VITE_APP_API_URL}/provider/offers?filter[sp_uid]=${providerId}` +
        `&perPage=${pageSize}&page=${pageIndex + 1}` +
        (sort ? `&sort=${sort}` : "");

      if (debouncedSearch) url += `&filter[offer_title]=${debouncedSearch}`;
      if (statusFilter) url += `&filter[offer_status]=${statusFilter}`;
      if (fromDate) url += `&filter[offer_add_date][from]=${fromDate}`;
      if (toDate) url += `&filter[offer_add_date][to]=${toDate}`;

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = res.data?.data ?? [];
      const total = res.data?.pagination?.total ?? 0;
      setTotalCount(total);
      return { data, totalCount: total };
    } catch (err) {
      console.error("Error fetching offers:", err);
      return { data: [], totalCount: 0 };
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };
  const handleRowClick = (providerId) => {
    navigate(`/OfferProfile/${providerId}`);
  };

  const columns = useMemo(
    () => [
      {
        id: "id",
        header: "Offer",
        accessorKey: "id",
        enableSorting: true,
      },
      {
        id: "title",
        header: "Offer",
        accessorKey: "title",
        enableSorting: true,
        meta: { className: "min-w-[320px]" },
        cell: ({ row }) => (
          <div className="text-sm">
            <strong
              className="cursor-pointer hover:text-primary"
              onClick={() => handleRowClick(row.original.id)}
            >
              {row.original.title}
            </strong>
          </div>
        ),
      },
      {
        id: "user.name",
        header: "Provider",
        accessorKey: "user.name",
        enableSorting: true,
        meta: { className: "min-w-[150px]" },
      },
      {
        id: "offer_images",
        header: "Business Name",
        accessorKey: "offer_images",
        enableSorting: true,
        meta: { className: "min-w-[220px]" },
        cell: ({ row }) => {
          const offer_images = row.original.offer_images || [];
          const city = row.original.city?.name;
          const business_name = row.original.business_name;

          // If offer_images is an array, display the first image
          if (Array.isArray(offer_images) && offer_images.length > 0) {
            return (
              <>
                <div className="flex items-center justify-start gap-x-4">
                  <img
                    src={offer_images[0]}
                    alt={city}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.target.src = "/placeholder-image.jpg"; // You may want to add a placeholder image
                    }}
                  />
                  <span>{business_name}</span>
                </div>
              </>
            );
          }

          // If it's a single string URL
          if (typeof offer_images === "string") {
            return (
              <div className="flex items-center">
                <img
                  src={offer_images}
                  alt={city}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = "/placeholder-image.jpg"; // You may want to add a placeholder image
                  }}
                />
              </div>
            );
          }

          return null;
        },
      },

      {
        id: "offer_add_date",
        header: "Created Date",
        accessorKey: "offer_add_date",
        enableSorting: true,
        meta: { className: "min-w-[190px]" },
      },
      {
        id: "offer_end_date",
        header: "End Date",
        accessorKey: "offer_end_date",
        enableSorting: true,
        meta: { className: "min-w-[150px]" },
      },
      {
        id: "coupon_end_date",
        header: "Coupon End Date",
        accessorFn: (row) => row.original.coupon_end_date,
        enableSorting: true,
        cell: ({ row }) => row.original.coupon_end_date ?? "—",
        meta: { className: "min-w-[170px]" },
      },

      {
        id: "offer_copouns_qty",
        header: "Coupons",
        accessorKey: "offer_copouns_qty",
        enableSorting: true,
        meta: { className: "min-w-[100px]" },
      },
      {
        id: "offer_price",
        header: "Price",
        accessorFn: (row) => row.offer_price + " " + row.currency_name,
        enableSorting: true,
        meta: { className: "min-w-[110px]" },
      },
      {
        id: "city",
        header: "City",
        accessorFn: (row) => row.city?.name,
        enableSorting: true,
        meta: { className: "min-w-[150px]" },
        cell: ({ row }) => {
          const image = row.original.city?.image;
          const name = row.original.city?.name;
          return (
            <div className="flex items-center gap-x-2">
              <img
                src={image}
                alt={name}
                className="w-10 h-10 rounded-full object-cover"
              />
              <span>{name}</span>
            </div>
          );
        },
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (row) => row.offer_status,
        enableSorting: true,
        cell: ({ row }) => {
          const status = row.original.offer_status;
          const color =
            status === "active"
              ? "success"
              : status === "inactive"
                ? "danger"
                : "warning";
          return (
            <span className={`badge badge-${color} badge-outline capitalize`}>
              {status}
            </span>
          );
        },
        meta: { className: "min-w-[90px]" },
      },
      {
        id: "count_of_reservations_on_this_offer",
        header: "Reservations",
        accessorKey: "count_of_reservations_on_this_offer",
        enableSorting: true,
        meta: { className: "min-w-[70px]" },
      },
      {
        id: "count_of_active_reservations_on_this_offer",
        header: "Reservations Active",
        accessorKey: "count_of_active_reservations_on_this_offer",
        enableSorting: true,
        meta: { className: "min-w-[100px]" },
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <button
            className="px-2 py-1 btn btn-sm text-gray-500"
            onClick={() => handleRowClick(row.original.id)}
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
      <div className="card-header px-2 flex-wrap gap-2 justify-between">
        <h3 className="card-title ">Showing {totalCount} Offers</h3>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="input input-sm w-72 h-9 hover:text-primary">
            <KeenIcon
              icon="magnifier"
              className="hover:text-primary text-gray-500 "
            />
            <input
              type="text"
              placeholder="Search by Name or Email"
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
            className="select select-sm w-40"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPageIndex(0);
              setRefetchKey((prev) => prev + 1);
            }}
          >
            <option value="">All Status</option>
            <option value="1">Active</option>
            <option value="0">Inactive</option>
            <option value="2">Waiting Confirmation</option>
          </select>
          <button
            className="btn btn-outline btn-primary btn-sm  flex-shrink-0"
            onClick={() => {
              /* handle add new offer */
            }}
          >
            Add New Offer
          </button>
        </div>
      </div>

      <div className="card-body p-0 overflow-x-auto relative">
        <DataGrid
          key={refetchKey}
          columns={columns}
          serverSide
          onFetchData={fetchOffers}
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
            empty: "No data available",
            loading: "Loading data...",
          }}
        />
        {loading && (
          <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 dark:bg-black/50 bg-white/90 rounded-lg shadow-lg">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-gray-700">
                Loading offers...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

OffersTable.propTypes = {
  providerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};

export { OffersTable };
