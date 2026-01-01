import { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { DataGrid, KeenIcon } from "@/components";
import { toAbsoluteUrl } from "@/utils";
const Providers = () => {
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("1");
  const [refetchKey, setRefetchKey] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

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
  }, [debouncedSearch, statusFilter]);

  const columns = useMemo(
    () => [
      {
        id: "id",
        header: "ID",
        accessorKey: "id",
        enableSorting: true,
        cell: ({ row }) => {
          const { id } = row.original;
          return <div className="text-sm font-medium">{id}</div>;
        },
      },
      {
        enableSorting: true,
        header: "Member",
        accessorKey: "name",
        cell: ({ row }) => {
          const { name, email, image } = row.original;
          return (
            <div className="flex items-center gap-2">
              <img
                loading="lazy"
                src={image || toAbsoluteUrl("/media/avatars/blank.png")}
                alt={name || "Unknown"}
                className="w-8 h-8 rounded-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = toAbsoluteUrl("/media/avatars/blank.png");
                }}
              />
              <div>
                <div className="font-semibold">{name}</div>
                <div className="text-muted text-xs">{email}</div>
              </div>
            </div>
          );
        },
      },
      {
        enableSorting: true,
        header: "Phone Number",
        accessorKey: "mobile",
        cell: ({ row }) => {
          const { country_code, mobile } = row.original;
          return (
            <div className="flex items-center">
              <span className="text-muted text-xs">+{country_code}</span>
              <span className="text-muted text-xs ml-1">{mobile}</span>
            </div>
          );
        },
      },
      {
        enableSorting: true,
        header: "Status",
        accessorKey: "person_status",
        cell: ({ row }) => {
          const status = row.original.person_status;
          const label = status === "active" ? "Active" : "Inactive";
          const color = status === "active" ? "success" : "danger";
          return (
            <span className={`badge badge-${color} badge-outline`}>
              {label}
            </span>
          );
        },
      },
    ],
    []
  );

  const fetchTeamMembers = async ({ pageIndex, pageSize, sorting }) => {
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
      const direction = sorting?.[0]?.desc ? "-" : "";

      let url = `${import.meta.env.VITE_APP_API_URL}/users/list?filter[is_admin]=1&perPage=${pageSize}&page=${pageIndex + 1}`;

      // Add status filter
      if (statusFilter !== "") {
        url += `&filter[person_status]=${statusFilter}`;
      }

      // Add search filters with smart detection
      if (debouncedSearch) {
        if (/^\d+$/.test(debouncedSearch)) {
          // If only numbers
          if (debouncedSearch.length <= 3) {
            // 1, 2, or 3 digits → search by person_uid
            url += `&filter[person_uid]=${debouncedSearch}`;
          } else {
            // 4 or more digits → search by person_mobile
            url += `&filter[person_mobile]=${debouncedSearch}`;
          }
        } else if (debouncedSearch.includes("@")) {
          // Contains "@" → email
          url += `&filter[person_email]=${debouncedSearch}`;
        } else {
          // Otherwise → name
          url += `&filter[person_name]=${debouncedSearch}`;
        }
      }

      // Add sorting
      if (sort) {
        url += `&sort=${direction}${sort}`;
      }

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const admins = res.data?.data ?? [];
      const total = res?.data?.pagination?.total ?? 0;

      return { data: admins, totalCount: total };
    } catch (err) {
      console.error("❌ Error fetching team members:", err);
      return { data: [], totalCount: 0 };
    } finally {
      setLoading(false);
    }
  };

  // Trigger table re-fetch when status changes
  const handleToggle = () => {
    setStatusFilter((prev) => (prev === "1" ? "0" : "1"));
    setRefetchKey((prev) => prev + 1);
  };

  return (
    <div className="card card-grid min-w-full">
      <div className="card-header flex-wrap gap-2 justify-between">
        <h3 className="card-title font-medium text-sm">Users</h3>
        <div className="flex items-center justify-between gap-2">
          <label className="input input-sm h-10 w-60">
            <KeenIcon icon="magnifier" />
            <input
              type="text"
              placeholder="Search by Name, Email or Mobile"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <label className="flex switch items-center justify-end w-32 gap-2 cursor-pointer">
            <span className="text-sm">Active Users</span>
            <input
              type="checkbox"
              className="toggle toggle-sm"
              checked={statusFilter === "1"}
              onChange={(e) => {
                handleToggle(e.target.value);
                setRefetchKey((prev) => prev + 1);
              }}
              aria-label="Toggle to show active or inactive users"
              role="switch"
              aria-checked={statusFilter === "1"}
            />
          </label>
        </div>
      </div>
      <div className="card-body relative">
        <DataGrid
          key={refetchKey}
          columns={columns}
          serverSide={true}
          onFetchData={fetchTeamMembers}
          isLoading={loading}
          layout={{
            cellsBorder: true,
            tableSpacing: "sm",
          }}
          pagination={{ page: pageIndex, size: pageSize }}
          onPaginationChange={({ page, size }) => {
            setPageIndex(page);
            setPageSize(size);
          }}
          messages={{
            empty: "No data available",
            loading: "Loading data...",
          }}
          getRowId={(row) => row.id}
        />
        {loading && (
          <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 dark:bg-black/50 bg-white/90 rounded-lg shadow-lg">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-gray-700">
                Loading admins...
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export { Providers };
