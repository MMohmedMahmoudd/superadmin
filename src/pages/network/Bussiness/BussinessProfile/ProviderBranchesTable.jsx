import { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { DataGrid, KeenIcon } from "@/components";
import PropTypes from "prop-types";
import { CitySelect, customSelectStyles, ZoneSelect } from "./";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import Select from "react-select";

const ProviderBranchesTable = ({ providerId }) => {
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [refetchKey, setRefetchKey] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [status, setStatus] = useState("");
  const navigate = useNavigate();
  const formik = useFormik({
    initialValues: {
      city_uid: "",
      zone_uid: "",
    },
    validationSchema: Yup.object({
      city_uid: Yup.string().required("City is required"),
      zone_uid: Yup.string().required("Zone is required"),
    }),
    onSubmit: (values) => {
      formik.setValues(values);
      setPageIndex(0);
      setRefetchKey((prev) => prev + 1);
    },
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPageIndex(0);
      setRefetchKey((prev) => prev + 1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, status, formik.values.city_uid, formik.values.zone_uid]);

  const fetchProviderData = async ({ pageIndex, pageSize }) => {
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

      // If branchId is provided, handle branch details
      // Otherwise handle table data
      const filteredBranches = branchesData.filter((branch) => {
        // Handle status filter
        if (status && branch.status?.toString() !== status) {
          return false;
        }
        // Handle city filter
        if (
          formik.values.city_uid &&
          formik.values.city_uid !== "" &&
          branch.city?.id?.toString() !== formik.values.city_uid.toString()
        ) {
          return false;
        }

        // Filter by zone if selected
        if (
          formik.values.zone_uid &&
          formik.values.zone_uid !== "" &&
          branch.zone?.id?.toString() !== formik.values.zone_uid.toString()
        ) {
          return false;
        }

        // Handle search filter
        if (debouncedSearch) {
          const searchLower = debouncedSearch.toLowerCase();
          return (
            branch.id?.toString().toLowerCase().includes(searchLower) ||
            branch.name?.toLowerCase().includes(searchLower) ||
            branch.phone?.toLowerCase().includes(searchLower) ||
            branch.address?.toLowerCase().includes(searchLower)
          );
        }

        return true;
      });

      const start = pageIndex * pageSize;
      const end = start + pageSize;
      const paginatedBranches = filteredBranches.slice(start, end);

      setTotalCount(filteredBranches.length);

      return {
        data: paginatedBranches,
        totalCount: filteredBranches.length,
      };
    } catch (err) {
      console.error("Error fetching provider data:", err);
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
            className={`badge badge-${row.original.status === 1 ? "success" : row.original.status === 0 ? "danger" : "warning"} badge-outline capitalize`}
          >
            ●{" "}
            {row.original.status === 1
              ? "Active"
              : row.original.status === 0
                ? "Inactive"
                : "Waiting Confirmation"}
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
            onClick={() =>
              navigate(`/branchprofile/${providerId}?branch=${row.original.id}`)
            }
          >
            <i className="ki-filled ki-notepad-edit"></i>
          </button>
        ),
      },
    ],
    [pageIndex, pageSize]
  );

  return (
    <div className="card p-3 pt-0">
      <div className="card-body p-0 overflow-x-auto relative">
        <div className="card-header px-2 flex-wrap gap-2 justify-between">
          <h3 className="card-title">Showing {totalCount} Branches</h3>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <label className="input input-sm w-72 h-9 hover:text-primary">
              <KeenIcon
                icon="magnifier"
                className="hover:text-primary text-gray-500"
              />
              <input
                type="text"
                placeholder="Search by ID, Name, Phone or Address"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </label>
            <CitySelect formik={formik} />
            <ZoneSelect formik={formik} />
            <Select
              classNamePrefix="react-select"
              placeholder="Select Status"
              options={[
                {
                  value: "1",
                  label: "Active",
                },
                {
                  value: "0",
                  label: "Inactive",
                },
                {
                  value: "3",
                  label: "Waiting Confirmation",
                },
              ]}
              value={
                [
                  {
                    value: "1",
                    label: "Active",
                  },
                  {
                    value: "0",
                    label: "Inactive",
                  },
                  {
                    value: "3",
                    label: "Waiting Confirmation",
                  },
                ].find((opt) => opt.value == formik.values.sp_status) || null
              }
              onChange={(newValue) => {
                formik.setFieldValue(
                  "sp_status",
                  newValue ? newValue.value : ""
                );
              }}
              styles={customSelectStyles}
            ></Select>
            <button
              className="btn btn-sm btn-outline btn-primary"
              onClick={() => navigate(`/addBranche/${providerId}`)}
            >
              Add New Branch
            </button>
          </div>
        </div>

        <DataGrid
          key={refetchKey}
          columns={columns}
          serverSide
          onFetchData={fetchProviderData}
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
      </div>
    </div>
  );
};

ProviderBranchesTable.propTypes = {
  providerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};

export { ProviderBranchesTable };
