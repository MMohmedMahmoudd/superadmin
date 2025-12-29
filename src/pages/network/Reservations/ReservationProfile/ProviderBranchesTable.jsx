import { useMemo, useState } from "react";
import axios from "axios";
import { DataGrid } from "@/components";
import PropTypes from "prop-types";

const ProviderBranchesTable = ({ providerId }) => {
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [refetchKey] = useState(0);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchBranchDetails = async (id) => {
    try {
      const token = JSON.parse(
        localStorage.getItem(
          import.meta.env.VITE_APP_NAME +
            "-auth-v" +
            import.meta.env.VITE_APP_VERSION
        )
      )?.access_token;

      const res = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}/provider/${providerId}/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const branch = res.data?.data?.branches?.find((b) => b.id === id);
      if (branch) {
        setSelectedBranch(branch);
        setModalOpen(true);
      }
    } catch (err) {
      console.error("Failed to fetch branch details", err);
    }
  };

  const fetchBranches = async ({ pageIndex, pageSize }) => {
    try {
      setLoading(true);
      const token = JSON.parse(
        localStorage.getItem(
          import.meta.env.VITE_APP_NAME +
            "-auth-v" +
            import.meta.env.VITE_APP_VERSION
        )
      )?.access_token;

      const res = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}/provider/${providerId}/profile`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const branchesData = res.data?.data?.branches ?? [];
      const start = pageIndex * pageSize;
      const end = start + pageSize;
      const paginatedBranches = branchesData.slice(start, end);

      return {
        data: paginatedBranches,
        totalCount: branchesData.length,
      };
    } catch (err) {
      console.error("Error fetching branches:", err);
      return { data: [], totalCount: 0 };
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const columns = useMemo(
    () => [
      {
        id: "id",
        header: "ID",
        accessorKey: "id",
        cell: ({ row }) => (
          <span className="text-sm font-medium">{row.original.id}</span>
        ),
        meta: { className: "min-w-[70px]" },
      },
      {
        id: "name",
        header: "Name",
        accessorKey: "name",
        cell: ({ row }) => (
          <div className="text-sm font-medium">{row.original.name}</div>
        ),
        meta: { className: "min-w-[150px]" },
      },
      {
        id: "phone",
        header: "Phone",
        accessorKey: "phone",
        cell: ({ row }) => <div className="text-sm">{row.original.phone}</div>,
        meta: { className: "min-w-[120px]" },
      },
      {
        id: "address",
        header: "Address",
        accessorKey: "address",
        cell: ({ row }) => (
          <div className="text-sm whitespace-pre-line">
            {row.original.address}
          </div>
        ),
        meta: { className: "min-w-[200px]" },
      },
      {
        id: "city",
        header: "City",
        cell: ({ row }) => (
          <div className="text-sm">{row.original.city?.name ?? "—"}</div>
        ),
        meta: { className: "min-w-[120px]" },
      },
      {
        id: "zone",
        header: "Zone",
        cell: ({ row }) => (
          <div className="text-sm">{row.original.zone?.name ?? "—"}</div>
        ),
        meta: { className: "min-w-[120px]" },
      },
      {
        id: "country",
        header: "Country",
        cell: ({ row }) => (
          <div className="text-sm">{row.original.country?.name ?? "—"}</div>
        ),
        meta: { className: "min-w-[120px]" },
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`badge badge-${row.original.status === 1 ? "success" : "danger"} badge-outline capitalize`}
          >
            ● {row.original.status === 1 ? "Active" : "Inactive"}
          </span>
        ),
        meta: { className: "min-w-[100px]" },
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <button
            className="px-2 py-1 btn btn-sm text-gray-500"
            onClick={() => fetchBranchDetails(row.original.id)}
          >
            <i className="ki-filled ki-notepad-edit"></i>
          </button>
        ),
      },
    ],
    []
  );

  return (
    <div className="card-body p-0 overflow-x-auto relative">
      <DataGrid
        key={refetchKey}
        columns={columns}
        serverSide
        onFetchData={fetchBranches}
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
          empty: "No branches found",
          loading: "Loading branches...",
        }}
      />

      {loading && (
        <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center">
          <div className="flex items-center gap-2 px-4 py-2 dark:bg-black/50 bg-white/90 rounded-lg shadow-lg">
            <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-gray-700">
              Loading branches...
            </span>
          </div>
        </div>
      )}

      {modalOpen && selectedBranch && (
        <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-100 w-full max-w-md rounded-lg p-6 shadow-lg relative">
            {/* Header */}
            <div className="flex items-center justify-between mb-5 border-b border-gray-200 pb-3">
              <h2 className="text-xl font-bold">Branch Details</h2>
              <button className="text-xl" onClick={() => setModalOpen(false)}>
                <i className="ki-duotone ki-cross-circle"></i>
              </button>
            </div>

            {/* Content */}
            <div className="divide-y divide-gray-200 space-y-5 text-base">
              <div>
                <div className="font-semibold text-gray-700">Branch Name</div>
                <div>{selectedBranch.name}</div>
              </div>

              <div className="pt-2">
                <div className="font-semibold text-gray-700">Phone</div>
                <div>{selectedBranch.phone}</div>
              </div>

              <div className="pt-2">
                <div className="font-semibold text-gray-700">Email</div>
                <div>{selectedBranch.email || "—"}</div>
              </div>

              <div className="pt-2">
                <div className="font-semibold text-gray-700">Address</div>
                <div>{selectedBranch.address}</div>
              </div>

              <div className="pt-2">
                <div className="font-semibold text-gray-700">Location</div>
                <div>
                  {selectedBranch.city?.name && `${selectedBranch.city.name}, `}
                  {selectedBranch.zone?.name && `${selectedBranch.zone.name}, `}
                  {selectedBranch.country?.name}
                </div>
              </div>

              <div className="pt-2">
                <div className="font-semibold text-gray-700">Coordinates</div>
                <div>
                  Lat: {selectedBranch.latitude}
                  <br />
                  Long: {selectedBranch.longitude}
                </div>
              </div>

              <div className="pt-2">
                <div className="font-semibold text-gray-700">Status</div>
                <span
                  className={`badge badge-${selectedBranch.status === 1 ? "success" : "danger"}`}
                >
                  {selectedBranch.status === 1 ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="pt-2">
                <div className="font-semibold text-gray-700">Branch Type</div>
                <span
                  className={`badge badge-${selectedBranch.main_branch === 1 ? "primary" : "info"}`}
                >
                  {selectedBranch.main_branch === 1
                    ? "Main Branch"
                    : "Sub Branch"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

ProviderBranchesTable.propTypes = {
  providerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};

export { ProviderBranchesTable };
