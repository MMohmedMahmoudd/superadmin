import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { DataGrid, KeenIcon } from "@/components";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";
import { toAbsoluteUrl } from "@/utils/Assets";

const ZonesContent = () => {
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

  const handleRowClick = (zoneId) => {
    navigate(`/EditZone/${zoneId}`);
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
        id: "name",
        header: "Zone",
        accessorKey: "name",
        enableSorting: true,
        cell: ({ row }) => {
          const { name } = row.original;
          return (
            <div className="flex items-center gap-3">
              <div>
                <div className="text-sm font-semibold">{name}</div>
              </div>
            </div>
          );
        },
      },
      {
        id: "city",
        header: "City",
        accessorFn: (row) => row.city,
        enableSorting: true,
        cell: ({ row }) => {
          const city = row.original.city;

          return (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{city}</span>
            </div>
          );
        },
      },

      {
        id: "country",
        header: "Country",
        accessorFn: (row) => row.country,
        enableSorting: true,
        cell: ({ row }) => {
          const country = row.original.country;
          const flagSrc = toAbsoluteUrl(
            `/media/flags/${country.toLowerCase().replace(/\s+/g, "-")}.svg`
          );

          return (
            <div className="flex items-center gap-3">
              <img
                src={flagSrc}
                className="w-9 h-9 rounded-full object-cover"
                alt={country}
                onError={(e) => (e.target.style.display = "none")}
              />
              <div>
                <div className="text-sm font-semibold">{country}</div>
              </div>
            </div>
          );
        },
      },
      {
        id: "zone_add_date",
        header: "Created At",
        accessorFn: (row) => row.zone_add_date,
        enableSorting: true,
        cell: ({ row }) => {
          const rawDate = row.original.zone_add_date;
          const formatted = new Date(rawDate).toLocaleDateString();
          return <span className="text-sm">{formatted}</span>;
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
      },
    ],
    []
  );

  const fetchProviders = async ({ pageIndex, pageSize }) => {
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

      // const sort = sorting?.[0]?.id;
      // const direction = sorting?.[0]?.desc ? '-' : '';

      const url =
        `${import.meta.env.VITE_APP_API_URL}/zones/list?perPage=${pageSize}&page=${pageIndex + 1}` +
        (debouncedSearch ? `&filter[zone_name_en]=${debouncedSearch}` : "");
      // + (statusFilter ? `&filter[sp_status]=${statusFilter}` : '')
      // + (sort ? `&sort=${sort}` : '');

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const rawZones = res.data?.data ?? [];
      const total = res.data?.pagination?.total ?? 0;

      // Flatten the new API shape for the grid
      const zones = rawZones.map((zone) => ({
        id: zone.id,
        name: zone?.name?.en || "",
        name_ar: zone?.name?.ar || "",
        city: zone?.city?.name?.en || "",
        city_ar: zone?.city?.name?.ar || "",
        country: zone?.country?.name?.en || "",
        country_ar: zone?.country?.name?.ar || "",
        zone_add_date: zone.zone_add_date,
      }));

      setTotalCount(total);
      console.log("zones:", zones);

      return { data: zones, totalCount: total };
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
          Showing {totalCount} Zones
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

export { ZonesContent };
