import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { DataGrid, KeenIcon } from "@/components";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { toAbsoluteUrl } from "@/utils/Assets";

const LocationsContent = () => {
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [refetchKey, setRefetchKey] = useState(0);
  const [statusFilter, setStatusFilter] = useState("");
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Debounce logic
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPageIndex(0);
      setRefetchKey((prev) => prev + 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

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
        id: "provider_name",
        header: "Provider Name",
        accessorKey: "name",
        enableSorting: true,
        cell: ({ row }) => {
          const { name, iso } = row.original;
          const flagSrc = toAbsoluteUrl(
            `/media/Flags-iso/${iso.toLowerCase()}.svg`
          );

          return (
            <div className="flex items-center gap-3">
              <img
                src={flagSrc}
                className="w-9 h-9 rounded-full object-cover"
                alt={name}
              />
              <div>
                <div className="text-sm font-semibold">{name}</div>
              </div>
            </div>
          );
        },
      },
      {
        id: "status",
        header: "Status",
        accessorFn: (row) => row.status,
        enableSorting: true,
        cell: ({ row }) => {
          const { id, status } = row.original;

          const handleToggle = async () => {
            try {
              const storedAuth = localStorage.getItem(
                import.meta.env.VITE_APP_NAME +
                  "-auth-v" +
                  import.meta.env.VITE_APP_VERSION
              );
              const authData = storedAuth ? JSON.parse(storedAuth) : null;
              const token = authData?.access_token;

              const newStatus = status === 1 ? 0 : 1;

              await axios.post(
                `${import.meta.env.VITE_APP_API_URL}/countries/change-status`,
                {
                  id,
                  status: newStatus,
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                }
              );

              enqueueSnackbar("Status updated successfully!", {
                variant: "success",
              });

              // Refetch data after toggle
              setRefetchKey((prev) => prev + 1);
            } catch (error) {
              console.error("Error changing status:", error);
              enqueueSnackbar("Failed to update status. Please try again.", {
                variant: "error",
              });
            }
          };

          return (
            <label className="flex switch items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="toggle toggle-sm"
                checked={status === 1}
                onChange={handleToggle}
              />
            </label>
          );
        },
        meta: { className: "min-w-[102px]" },
      },
      // {
      //   id: "actions",
      //   header: "",
      //   enableSorting: false,
      //   cell: () => (
      //     <button
      //       className="px-2 py-1 btn btn-sm text-gray-500"
      //       onClick={() => handleRowClick(row.original.id)}
      //     >
      //       <i className="ki-filled ki-notepad-edit"></i>
      //     </button>
      //   ),
      // },
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

      // if (!token) {
      //   window.location.href = '/auth/login';
      //   return { data: [], totalCount: 0 };
      // }

      const sort = sorting?.[0]?.id;
      // const direction = sorting?.[0]?.desc ? '-' : '';

      const url =
        `${import.meta.env.VITE_APP_API_URL}/countries/list?perPage=${pageSize}&page=${pageIndex + 1}` +
        (debouncedSearch ? `&filter[name_en]=${debouncedSearch}` : "") +
        (statusFilter ? `&filter[sp_status]=${statusFilter}` : "") +
        (sort ? `&sort=${sort}` : "");

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
          Showing {totalCount} Countries
        </h3>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <label className="input input-sm w-72">
            <KeenIcon icon="magnifier" />
            <input
              type="text"
              placeholder="Search by Name or Email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
      </div>
      <div className="card-body">
        <DataGrid
          key={refetchKey}
          columns={columns}
          serverSide
          onFetchData={fetchProviders}
          isLoading={loading}
          pagination={{
            page: pageIndex,
            size: pageSize,
            onPageChange: setPageIndex,
            onPageSizeChange: setPageSize,
          }}
        />
      </div>
    </div>
  );
};

export { LocationsContent };
