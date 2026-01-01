import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { DataGrid, KeenIcon } from "@/components";
import { useNavigate } from "react-router-dom";

const PromococesContent = () => {
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [refetchKey, setRefetchKey] = useState(0);
  const navigate = useNavigate();

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPageIndex(0);
      setRefetchKey((prev) => prev + 1);
    }, 100);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setRefetchKey((prev) => prev + 1);
  }, [debouncedSearch]);

  const handleRowClick = (promocodeId) => {
    navigate(`/editpromocode/${promocodeId}`);
  };

  const columns = useMemo(
    () => [
      {
        id: "id",
        header: "ID",
        accessorKey: "id",
        enableSorting: true,
        meta: { className: "w-[50px]" },
      },
      {
        id: "code",
        header: "Promo Code",
        accessorKey: "code",
        enableSorting: true,
        meta: { className: "min-w-[120px]" },
      },
      {
        id: "service_type",
        header: "Service Type",
        accessorKey: "service_type",
        enableSorting: true,
        meta: { className: "min-w-[100px]" },
      },
      {
        id: "type",
        header: "Type",
        accessorKey: "type",
        enableSorting: true,
        meta: { className: "min-w-[100px]" },
        cell: ({ row }) => {
          const type = row.original.type;
          return <span className="capitalize">{type}</span>;
        },
      },
      {
        id: "percentage",
        header: "Percentage",
        accessorKey: "percentage",
        enableSorting: true,
        meta: { className: "min-w-[100px]" },
        cell: ({ row }) => {
          const percentage = row.original.percentage;
          return <span>{percentage}%</span>;
        },
      },
      {
        id: "user",
        header: "User",
        accessorKey: "user.name",
        enableSorting: true,
        meta: { className: "min-w-[150px]" },
        cell: ({ row }) => {
          const user = row.original.user;
          return <span>{user?.name || "-"}</span>;
        },
      },
      {
        id: "using_limit",
        header: "Usage Limit",
        accessorKey: "using_limit",
        enableSorting: true,
        meta: { className: "min-w-[100px]" },
      },
      {
        id: "using_count",
        header: "Used Count",
        accessorKey: "using_count",
        enableSorting: true,
        meta: { className: "min-w-[100px]" },
      },
      {
        id: "status",
        header: "Status",
        accessorKey: "status",
        enableSorting: true,
        meta: { className: "min-w-[100px]" },
        cell: ({ row }) => {
          const status = row.original.status;
          return (
            <span
              className={`px-2 py-2  badge badge-outline rounded-lg text-xs font-medium ${
                status === "Active" ? "badge-success " : "badge-danger "
              }`}
            >
              {status}
            </span>
          );
        },
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

  const fetchPromocodes = async ({ pageIndex, pageSize, sorting }) => {
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

      const sort = sorting?.[0]?.id;

      const params = [`perPage=${pageSize}`, `page=${pageIndex + 1}`];

      if (debouncedSearch) {
        if (/^\d+$/.test(debouncedSearch)) {
          params.push(`filter[id]=${debouncedSearch}`);
        } else {
          params.push(`filter[code]=${debouncedSearch}`);
        }
      }
      if (sort) {
        params.push(`sort=${sort}`);
      }

      const url =
        `${import.meta.env.VITE_APP_API_URL}/promocodes?` + params.join("&");

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const promocodes = res.data?.data ?? [];
      const total = res.data?.pagination?.total ?? 0;

      setTotalCount(total);

      return { data: promocodes, totalCount: total };
    } catch (err) {
      console.error("❌ Error fetching promocodes:", err);
      return { data: [], totalCount: 0 };
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card card-grid col-span-4 relative">
      <div className="card-header flex-wrap gap-2 justify-between">
        <h3 className="card-title font-medium text-sm">
          Showing {totalCount} promocodes
        </h3>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="input input-sm h-10 w-72">
            <KeenIcon icon="magnifier" />
            <input
              type="text"
              placeholder="Search by Promo Code"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
      </div>
      <div className="card-body overflow-x-auto">
        <DataGrid
          key={refetchKey}
          columns={columns}
          serverSide
          onFetchData={fetchPromocodes}
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
          <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center h-full">
            <div className="flex items-center gap-2 px-4 py-2 dark:bg-black/50 bg-white/90 rounded-lg shadow-lg">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-gray-700">
                Loading promocodes...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { PromococesContent };
