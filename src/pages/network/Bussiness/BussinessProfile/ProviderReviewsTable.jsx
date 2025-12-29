import { useMemo, useState, useEffect } from "react";
import axios from "axios";
import { DataGrid, KeenIcon, DateRangeFilter } from "@/components";
import PropTypes from "prop-types";
import { Rating } from "@mui/material";
import { RateSelect } from "./RateSelect";
import { useSnackbar } from "notistack";
import Select from "react-select";

const ProviderReviewsTable = ({ providerId }) => {
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [refetchKey, setRefetchKey] = useState(0);
  const [selectedReview, setSelectedReview] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [rate, setRate] = useState("");
  const { enqueueSnackbar } = useSnackbar();
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
  }, [debouncedSearch, fromDate, toDate, rate]);

  const fetchReviewDetails = async (id) => {
    try {
      const token = JSON.parse(
        localStorage.getItem(
          import.meta.env.VITE_APP_NAME +
            "-auth-v" +
            import.meta.env.VITE_APP_VERSION
        )
      )?.access_token;

      const res = await axios.get(
        `${import.meta.env.VITE_APP_API_URL}/review/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSelectedReview(res.data.data);
      setModalOpen(true);
    } catch (err) {
      console.error("Failed to fetch review details", err);
    }
  };

  const fetchReviews = async ({ pageIndex, pageSize, sorting }) => {
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
        `${import.meta.env.VITE_APP_API_URL}/provider/${providerId}/reviews` +
        `?perPage=${pageSize}&page=${pageIndex + 1}` +
        (sort ? `&sort=${sort}` : "");

      if (debouncedSearch) {
        if (!isNaN(debouncedSearch)) {
          url += `&filter[review_uid]=${debouncedSearch}`;
        } else {
          url += `&filter[person_name]=${debouncedSearch}`;
        }
      }
      if (fromDate) url += `&filter[review_add_date][from]=${fromDate}`;
      if (toDate) url += `&filter[review_add_date][to]=${toDate}`;
      if (rate) url += `&filter[rate]=${Number(rate)}`;

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
      console.error("Error fetching reviews:", err);
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
        id: "review_uid",
        header: "Review ID",
        accessorKey: "review_uid",
        cell: ({ row }) => (
          <span className="text-sm font-medium">{row.original.review_uid}</span>
        ),
      },
      {
        id: "person_name",
        header: "Customer",
        accessorKey: "person_name",
        cell: ({ row }) => {
          const { person_name, person_image } = row.original;
          return (
            <div className="flex items-center gap-3">
              <img
                src={person_image}
                alt={person_name}
                className="w-9 h-9 rounded-full object-cover"
              />
              <div className="text-sm font-medium">{person_name}</div>
            </div>
          );
        },
        meta: { className: "min-w-[220px]" },
      },
      {
        id: "comment",
        header: "Comment",
        cell: ({ row }) => (
          <div className="text-sm whitespace-pre-line">
            <strong>{row.original.review_title}</strong>
            <br />
            {row.original.review_content}
          </div>
        ),
        meta: { className: "min-w-[300px]" },
      },
      {
        id: "rating",
        header: "Rating",
        accessorKey: "rating_rate",
        cell: ({ row }) => (
          <Rating
            value={parseFloat(row.original.rating_rate)}
            readOnly
            precision={0.5}
            size="small"
          />
        ),
        meta: { className: "min-w-[120px]" },
      },
      {
        id: "review_add_date",
        header: "Review Date",
        accessorKey: "review_add_date",
        cell: ({ row }) => {
          const date = new Date(row.original.review_add_date);
          return date.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          });
        },
        meta: { className: "min-w-[150px]" },
      },
      {
        id: "review_status",
        header: "Status",
        accessorKey: "review_status",
        cell: ({ row }) => {
          const isActive = row.original.review_status === "active";
          return (
            <span
              className={`badge badge-${isActive ? "success" : "danger"} badge-outline capitalize`}
            >
              ● {isActive ? "Active" : "Inactive"}
            </span>
          );
        },
        meta: { className: "min-w-[120px]" },
      },
      {
        id: "actions",
        header: "",
        enableSorting: false,
        cell: ({ row }) => (
          <button
            className="px-2 py-1 btn btn-sm text-gray-500"
            onClick={() => fetchReviewDetails(row.original.review_uid)}
          >
            <i className="ki-filled ki-notepad-edit"></i>
          </button>
        ),
      },
    ],
    []
  );

  const handleStatusChange = async (newStatus) => {
    if (!selectedReview?.review_uid) return;

    try {
      const token = JSON.parse(
        localStorage.getItem(
          import.meta.env.VITE_APP_NAME +
            "-auth-v" +
            import.meta.env.VITE_APP_VERSION
        )
      )?.access_token;

      await axios.post(
        `${import.meta.env.VITE_APP_API_URL}/review/${selectedReview.review_uid}/update`,
        {
          _method: "PUT",
          review_status: newStatus && newStatus != 0 ? 1 : 0,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Update locally
      setSelectedReview((prev) => ({
        ...prev,
        review_status: newStatus ? "active" : "inactive",
      }));

      enqueueSnackbar("Review status updated successfully!", {
        variant: "success",
      });
      setRefetchKey((prev) => prev + 1);
      setTimeout(() => {
        setModalOpen(false);
      }, 1000);
    } catch (error) {
      console.error("Failed to update review status:", error);
      enqueueSnackbar("Failed to update review status", { variant: "error" });
    }
  };

  return (
    <div className="card p-3 pt-0">
      <div className="card-body p-0 overflow-x-auto relative">
        <div className="card-header px-2 flex-wrap gap-2 justify-between">
          <h3 className="card-title ">Showing {totalCount} Reviews</h3>
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

            <RateSelect value={rate} onChange={setRate} />
          </div>
        </div>
        <DataGrid
          key={refetchKey}
          columns={columns}
          serverSide
          onFetchData={fetchReviews}
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
            empty: "No reviews available",
            loading: "Loading reviews...",
          }}
        />
        {loading && (
          <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center">
            <div className="flex items-center gap-2 px-4 py-2 dark:bg-black/50 bg-white/90 rounded-lg shadow-lg">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium text-gray-700">
                Loading reviews...
              </span>
            </div>
          </div>
        )}
        {modalOpen && selectedReview && (
          <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-100 w-full max-w-md rounded-lg p-6 shadow-lg relative">
              {/* Header */}
              <div className="flex items-center justify-between mb-5 border-b border-gray-200 pb-3">
                <h2 className="text-xl font-bold">View Rate & Comment</h2>
                <button className="text-xl" onClick={() => setModalOpen(false)}>
                  <i className="ki-duotone ki-cross-circle"></i>
                </button>
              </div>
              {/* Content */}
              <div className="divide-y divide-gray-200 space-y-5 text-base">
                <div>
                  <div className="font-semibold text-gray-700">Name</div>
                  <div>{selectedReview.person_name}</div>
                </div>
                <div className="pt-2">
                  <div className="font-semibold text-gray-700">Rate</div>
                  <Rating
                    value={parseFloat(selectedReview.rating_rate)}
                    readOnly
                    precision={0.5}
                  />
                </div>
                <div className="pt-2">
                  <div className="font-semibold text-gray-700">Comment</div>
                  <p className=" whitespace-pre-line">
                    {selectedReview.review_content}
                  </p>
                </div>
                <div className="pt-2 flex items-end gap-2">
                  {/* <div className="parent">
                    <div className="font-semibold text-gray-700">Status</div>
                    <span
                      className={`badge badge-${selectedReview.review_status === "active" ? "success" : "danger"}`}
                    >
                      {selectedReview.review_status === "active"
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div> */}
                  <label className="flex flex-col items-start gap-2 cursor-pointer">
                    <div className="font-semibold text-gray-700">
                      Change Status
                    </div>
                    <Select
                      options={[
                        { value: "1", label: "Active" },
                        { value: "0", label: "Inactive" },
                      ]}
                      value={{
                        value:
                          selectedReview.review_status == "active" ||
                          selectedReview.review_status == 1
                            ? "1"
                            : "0",
                        label:
                          selectedReview.review_status == "active" ||
                          selectedReview.review_status == 1
                            ? "Active"
                            : "Inactive",
                      }}
                      onChange={(e) => handleStatusChange(e?.value)}
                      styles={{
                        control: (provided, state) => ({
                          ...provided,
                          backgroundColor:
                            selectedReview.review_status == "active" ||
                            selectedReview.review_status == 1
                              ? "rgba(34, 197, 94, 0.1)" // green with 10% opacity
                              : "rgba(239, 68, 68, 0.1)", // red with 10% opacity
                          borderWidth: "1px",
                          borderStyle: "solid",
                          borderColor:
                            selectedReview.review_status == "active" ||
                            selectedReview.review_status == 1
                              ? "rgb(34, 197, 94)" // green border
                              : "rgb(239, 68, 68)", // red border
                          borderRadius: "8px",
                          boxShadow: state.isFocused
                            ? "0 0 0 3px var(--shadow-focus)"
                            : "none",
                          "&:hover": {
                            borderColor:
                              selectedReview.review_status == "active" ||
                              selectedReview.review_status == 1
                                ? "rgb(34, 197, 94)"
                                : "rgb(239, 68, 68)",
                          },
                          color: "var(--text)",
                          minHeight: "41px",
                          padding: "4px",
                          fontSize: "0.75rem",
                        }),
                        indicatorSeparator: () => ({
                          display: "none",
                        }),

                        menu: (provided) => ({
                          ...provided,
                          backgroundColor: "var(--menu-bg)",
                          borderRadius: "4px",
                          boxShadow:
                            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                          maxHeight: "200px",
                          color: "var(--text)",
                          overflowY: "auto",
                          border: "1px solid var(--border-border)",
                          fontSize: "0.75rem",
                        }),
                        option: (provided, state) => ({
                          ...provided,
                          backgroundColor: state.isFocused
                            ? "var(--border-hover-border)"
                            : "transparent",
                          "&:hover": {
                            backgroundColor: "var(--menu-w-bg)",
                          },
                          color: "var(--text)",
                          cursor: "pointer",
                          padding: "8px 12px",
                        }),
                        singleValue: (provided) => ({
                          ...provided,
                          color: "var(--text)",
                        }),
                        placeholder: (provided) => ({
                          ...provided,
                          color: "var(--bs-gray-500)",
                          fontSize: "0.875rem",
                        }),
                        dropdownIndicator: (provided) => ({
                          ...provided,
                          color: "var(--bs-gray-500)",
                          "&:hover": {
                            color: "var(--bs-primary)",
                          },
                        }),
                        clearIndicator: (provided) => ({
                          ...provided,
                          color: "var(--bs-gray-500)",
                          "&:hover": {
                            color: "var(--bs-danger)",
                          },
                        }),
                        input: (provided) => ({
                          ...provided,
                          color: "var(--text)",
                        }),
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

ProviderReviewsTable.propTypes = {
  providerId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};

export { ProviderReviewsTable };
