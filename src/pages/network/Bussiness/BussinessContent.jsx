import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { DataGrid, KeenIcon } from "@/components";
import { useNavigate } from "react-router-dom";
import { toAbsoluteUrl } from "@/utils";
const BussinessContent = () => {
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [refetchKey, setRefetchKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const navigate = useNavigate();

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPageIndex(0);
      setRefetchKey((prev) => prev + 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleRowClick = (providerId) => {
    navigate(`/businessprofile/${providerId}`);
  };

  const columns = useMemo(
    () => [
      {
        id: "sp_uid",
        header: "ID",
        accessorKey: "id",
        enableSorting: true,
        cell: ({ row }) => {
          const { id } = row.original;
          return <div className="text-sm font-medium">{id}</div>;
        },
        meta: { className: "w-[50px]" },
      },
      {
        id: "provider_name",
        header: "Business Name",
        accessorKey: "name",
        enableSorting: true,
        cell: ({ row }) => {
          const { name, image, user } = row.original;
          return (
            <div className="flex items-center gap-3">
              <img
                src={image || toAbsoluteUrl("/media/avatars/blank.png")}
                className="w-9 h-9 rounded-full object-cover"
                alt={name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = toAbsoluteUrl("/media/avatars/blank.png");
                }}
              />
              <div>
                <div
                  className="text-sm font-semibold hover:text-primary cursor-pointer "
                  onClick={() => handleRowClick(row.original.id)}
                >
                  {name}
                </div>
                <div className="text-xs text-muted">{user?.email ?? "—"}</div>
              </div>
            </div>
          );
        },
        meta: { className: "min-w-[100px] " },
      },
      {
        id: "type",
        header: "Type",
        accessorFn: (row) => row.type?.name,
        enableSorting: true,
        cell: ({ row }) => row.original.type?.name ?? "—",
      },
      {
        id: "city.name",
        header: "City",
        accessorFn: (row) => row.main_branch?.city?.name,
        enableSorting: true,
        cell: ({ row }) => row.original.main_branch?.city?.name ?? "—",
        meta: { className: "min-w-[100px]" },
      },
      {
        id: "sp_status",
        header: "Status",
        accessorFn: (row) => row.status,
        enableSorting: true,
        cell: ({ row }) => {
          const status = row.original.status;
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
        meta: { className: "min-w-[102px]   " },
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
        meta: { className: "w-[50px]" },
      },
    ],
    []
  );

  const fetchProviders = async ({ pageIndex, pageSize, sorting }) => {
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

      const sort = sorting?.[0]?.id ?? "sp_uid";
      const direction = sorting?.[0]?.desc ? "-" : "";
      const sort2 = sorting?.[1]?.id ?? "sp_status";
      const direction2 = sorting?.[1]?.desc ? "-" : "";

      let url = `${import.meta.env.VITE_APP_API_URL}/providers/list?perPage=${pageSize}&page=${pageIndex + 1}`;
      if (debouncedSearch) {
        const isId =
          debouncedSearch.startsWith("SP") || /^\d+$/.test(debouncedSearch);
        if (isId) {
          url += `&filter[sp_uid]=${debouncedSearch}`;
        } else {
          url += `&filter[sp_name]=${debouncedSearch}`;
        }
      }
      if (statusFilter) url += `&filter[sp_status]=${statusFilter}`;
      if (typeFilter) url += `&filter[sp_type_uid]=${typeFilter}`;
      if (sort) url += `&sort=${direction}${sort}`;
      if (sort2) url += `&sort2=${direction2}${sort2}`;

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const providers = res.data?.data ?? [];
      const total = res.data?.pagination?.total ?? 0;

      setTotalCount(total);
      console.log("providers:", providers);

      return { data: providers, totalCount: total };
    } catch (err) {
      console.error("❌ Error fetching providers:", err);
      return { data: [], totalCount: 0 };
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card card-grid min-w-full">
      <div className="card-header flex-wrap gap-2 justify-between">
        <h3 className="card-title font-medium text-sm">
          Showing {totalCount} Business
        </h3>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="input input-sm w-60 h-10">
            <KeenIcon icon="magnifier" />
            <input
              type="text"
              placeholder="Search by Name or id"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>

          <select
            className="select w-20 "
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPageIndex(0);
              setRefetchKey((prev) => prev + 1);
            }}
          >
            <option value="">Status</option>
            <option value="0">Inactive</option>
            <option value="1">Active</option>
            <option value="2">Waiting Confirmation</option>
          </select>

          <select
            className="select w-48"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPageIndex(0);
              setRefetchKey((prev) => prev + 1);
            }}
          >
            <option value="">All Types</option>
            <option value="1">Accommodation</option>
            <option value="2">Food & Drink</option>
            <option value="3">Transportation</option>
            <option value="4">Tours & Trips</option>
            <option value="5">Activities</option>
          </select>
        </div>
      </div>
      <div className="card-body p-0 overflow-x-auto relative">
        <DataGrid
          key={refetchKey}
          columns={columns}
          serverSide
          onFetchData={fetchProviders}
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
            empty: "No businesses available",
            loading: "Loading businesses...",
          }}
        />
        {loading && (
          <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 dark:bg-black/50 bg-white/90 rounded-lg shadow-lg">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-gray-700">
                Loading businesses...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { BussinessContent };
