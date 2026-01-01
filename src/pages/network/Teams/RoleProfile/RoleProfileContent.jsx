import { useFormik } from "formik";
import * as Yup from "yup";
import { useState, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import { useSnackbar } from "notistack";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DataGrid } from "@/components";
import { toAbsoluteUrl } from "@/utils";

const RoleProfileContent = ({ roleId, role }) => {
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  // eslint-disable-next-line no-unused-vars
  const [refetchKey, setRefetchKey] = useState(0);
  const [responseData, setResponseData] = useState(null);

  // Handle API response data
  useEffect(() => {
    if (responseData) {
      console.log("useEffect triggered with responseData:", responseData);

      if (responseData.success === false) {
        // Handle validation errors
        const fieldErrors = responseData.data || {};
        console.log("Field errors from API:", fieldErrors);

        // Set formik field errors
        Object.entries(fieldErrors).forEach(([field, errors]) => {
          if (Array.isArray(errors) && errors.length > 0) {
            formik.setFieldError(field, errors[0]);
            formik.setFieldTouched(field, true);
          }
        });

        // Show general error message
        enqueueSnackbar(
          responseData.message || "Validation failed. Please check the form.",
          {
            variant: "error",
            anchorOrigin: { vertical: "top", horizontal: "right" },
            autoHideDuration: 4000,
          }
        );

        // Show individual field error messages
        Object.entries(fieldErrors).forEach(([field, errors]) => {
          if (Array.isArray(errors) && errors.length > 0) {
            enqueueSnackbar(`${field}: ${errors[0]}`, {
              variant: "error",
              anchorOrigin: { vertical: "top", horizontal: "right" },
              autoHideDuration: 4000,
            });
          }
        });
      } else if (responseData.success === true) {
        // Handle success
        enqueueSnackbar("Role updated successfully!", {
          variant: "success",
          anchorOrigin: { vertical: "top", horizontal: "right" },
          autoHideDuration: 4000,
        });
        navigate("/Teams?tab=roles");
      }

      // Clear response data after processing
      setResponseData(null);
    }
  }, [responseData, enqueueSnackbar, navigate]);

  // Flatten permissions for form handling
  const flattenPermissions = (permissions) => {
    const flattened = {};
    if (!permissions) return flattened;

    console.log("Original permissions from API:", permissions);
    console.log("Keys in permissions object:", Object.keys(permissions));

    // Check for logs specifically
    const logKeys = Object.keys(permissions).filter(
      (key) =>
        key.includes("log") || key.includes("Log") || key.includes("logs")
    );
    console.log("Log-related keys found:", logKeys);

    // Check for service type keys specifically
    const serviceTypeKeys = Object.keys(permissions).filter(
      (key) =>
        key.includes("type") || key.includes("Type") || key.includes("service")
    );
    console.log("Service type-related keys found:", serviceTypeKeys);

    // Handle both nested and flat permission structures from API response
    Object.entries(permissions).forEach(([key, value]) => {
      // Skip non-permission fields
      if (key === "id" || key === "group_uid" || key === "group_name") {
        return;
      }

      console.log(`Processing key: ${key}, value:`, value);

      // If the value is an object, it's a nested structure
      if (typeof value === "object" && value !== null) {
        Object.entries(value).forEach(([perm, permValue]) => {
          let formKey = `${key}_${perm}`;

          // Handle special cases where API response keys don't match form keys
          if (key === "branches") {
            formKey = `sp_branches_${perm}`;
          } else if (key === "providers") {
            formKey = `sp_main_${perm}`;
          } else if (key === "roles") {
            formKey = `groups_${perm}`;
          } else if (key === "promocodes") {
            formKey = `promo_codes_${perm}`;
          } else if (key === "stuff" && perm === "delete") {
            formKey = `stuff_delete`;
          } else if (key === "bookings" && perm === "invoice") {
            formKey = `bookings_invoice`;
          } else if (
            key === "servicetypes" ||
            key === "service_types" ||
            key === "sp_types"
          ) {
            formKey = `sp_type_${perm}`;
          } else if (key === "logs" || key === "log" || key === "logging") {
            formKey = `log_${perm}`;
          } else if (key === "users") {
            // Map users permissions to form keys (users_menu, users_list, etc.)
            formKey = `users_${perm}`;
          }

          console.log(`Mapped ${key}_${perm} to ${formKey}`);
          flattened[formKey] = permValue === 1;
        });
      } else {
        // Handle flat structure where keys are already in the correct format
        // But we need to handle special cases
        let formKey = key;

        // Handle special cases for flat structure
        if (key.startsWith("sp_types_")) {
          formKey = key.replace("sp_types_", "sp_type_");
        } else if (key.startsWith("logs_") || key.startsWith("log_")) {
          formKey = key.replace(/^(logs_|log_)/, "log_");
        }

        console.log(`Flat key: ${key} -> ${formKey}`);
        flattened[formKey] = value === 1;
      }
    });

    console.log("Flattened permissions for form:", flattened);
    return flattened;
  };

  // Send flattened permissions directly to API
  const preparePermissionsForAPI = (values) => {
    const permissions = {};

    Object.entries(values).forEach(([key, value]) => {
      if (key === "role_name") return; // Skip role name

      // Handle special mapping for users permissions (form keys to API keys)
      if (key === "users_menu") {
        permissions["u_patients_menu"] = value ? 1 : 0;
      } else if (key === "users_list") {
        permissions["u_patients_list"] = value ? 1 : 0;
      } else if (key === "users_add") {
        permissions["u_patients_add"] = value ? 1 : 0;
      } else if (key === "users_edit") {
        permissions["u_patients_edit"] = value ? 1 : 0;
      } else if (key === "users_delete") {
        permissions["u_patients_delete"] = value ? 1 : 0;
      } else if (key === "bookings_invoice") {
        // Map bookings_invoice back to bookings_invoice_view for API
        permissions["bookings_invoice_view"] = value ? 1 : 0;
      } else if (key === "offers_menu") {
        permissions["offers_menu"] = value ? 1 : 0;
      } else if (key === "offers_list") {
        permissions["offers_list"] = value ? 1 : 0;
      } else if (key === "offers_add") {
        permissions["offers_add"] = value ? 1 : 0;
      } else if (key === "offers_edit") {
        permissions["offers_edit"] = value ? 1 : 0;
      } else if (key === "offers_delete") {
        permissions["offers_delete"] = value ? 1 : 0;
      } else if (key === "stuff_delete") {
        // Map stuff_delete back to stuff_del for API
        permissions["stuff_del"] = value ? 1 : 0;
      } else {
        // Send other keys exactly as they are in the form
        permissions[key] = value ? 1 : 0;
      }
    });

    console.log("Permissions being sent to API:", permissions);
    return permissions;
  };

  const formik = useFormik({
    initialValues: {
      role_name: role?.name || "",
      ...flattenPermissions(role?.permissions || {}),
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      role_name: Yup.string().required("Role name is required"),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setLoading(true);

        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
          enqueueSnackbar("Please fix the errors before submitting.", {
            variant: "error",
          });
          return;
        }

        const token = JSON.parse(
          localStorage.getItem(
            import.meta.env.VITE_APP_NAME +
              "-auth-v" +
              import.meta.env.VITE_APP_VERSION
          )
        )?.access_token;

        if (!token) {
          enqueueSnackbar("Authentication token not found", {
            variant: "error",
          });
          return;
        }

        const formData = new FormData();

        // Add role name
        formData.append("group_name", values.role_name);

        // Add permissions
        const permissions = preparePermissionsForAPI(values);
        console.log("Permissions being sent:", permissions);
        Object.entries(permissions).forEach(([key, value]) => {
          formData.append(key, value);
        });

        formData.append("_method", "PUT");

        const response = await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/roles/${roleId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log("Full response:", response);
        console.log("Response data:", response.data);
        console.log("Response data structure:", {
          success: response.data.success,
          message: response.data.message,
          data: response.data.data,
          hasData: !!response.data.data,
          dataKeys: response.data.data ? Object.keys(response.data.data) : [],
        });

        // Store response data in state for processing
        setResponseData(response.data);
      } catch (error) {
        console.log("Network error caught:", error);
        const msg = error?.response?.data?.message || "Failed to update role.";
        enqueueSnackbar(msg, { variant: "error" });
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    },
  });

  // Permission sections configuration - using flattened keys as per API
  const permissionSections = [
    {
      title: "Service Types",
      key: "sp_type",
      permissions: ["menu", "list", "add", "edit", "delete"],
    },
    {
      title: "Providers",
      key: "sp_main",
      permissions: ["menu", "list", "add", "edit", "view", "delete"],
    },
    {
      title: "Categories",
      key: "sp_categories",
      permissions: ["menu", "list", "add", "edit", "view", "delete"],
    },
    {
      title: "Branches",
      key: "sp_branches",
      permissions: ["menu", "list", "add", "edit", "view", "delete"],
    },
    {
      title: "Cities",
      key: "cities",
      permissions: ["menu", "list", "add", "edit", "delete"],
    },
    {
      title: "Zones",
      key: "zones",
      permissions: ["menu", "list", "add", "edit", "delete"],
    },
    {
      title: "Countries",
      key: "countries",
      permissions: ["menu", "list", "add", "edit", "delete"],
    },
    {
      title: "Bookings",
      key: "bookings",
      permissions: ["menu", "list", "add", "edit", "delete", "invoice"],
    },
    {
      title: "Notifications",
      key: "notifications",
      permissions: ["menu", "list", "add", "delete"],
    },
    {
      title: "Logs",
      key: "log",
      permissions: ["menu", "list", "delete"],
    },
    {
      title: "Admins",
      key: "admins",
      permissions: ["menu", "list", "add", "edit", "delete"],
    },
    {
      title: "Roles",
      key: "groups",
      permissions: ["menu", "list", "add", "edit", "delete"],
    },
    {
      title: "Promo Codes",
      key: "promo_codes",
      permissions: ["menu", "list", "add", "edit", "delete"],
    },
    {
      title: "Settings",
      key: "settings",
      permissions: ["menu", "list", "edit"],
    },
    {
      title: "Staff",
      key: "stuff",
      permissions: ["menu", "list", "add", "edit", "delete"],
    },
    {
      title: "Users",
      key: "users",
      permissions: ["menu", "list", "add", "edit", "delete"],
    },
    {
      title: "Offers",
      key: "offers",
      permissions: ["menu", "list", "add", "edit", "delete"],
    },
  ];

  // DataGrid columns for team members
  const columns = useMemo(
    () => [
      {
        id: "id",
        header: "ID",
        accessorKey: "id",
        enableSorting: true,
        cell: ({ row }) => row.original.id ?? "—",
        meta: { className: "min-w-[100px]" },
      },
      {
        id: "person_name",
        header: "Member",
        accessorKey: "person.person_name",
        enableSorting: true,
        cell: ({ row }) => {
          const { person_name, person_image, person_email } =
            row.original.person || {};
          return (
            <div className="flex items-center gap-3">
              <img
                src={person_image || toAbsoluteUrl("/media/avatars/blank.png")}
                className="w-9 h-9 rounded-full object-cover"
                alt={person_name}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = toAbsoluteUrl("/media/avatars/blank.png");
                }}
              />
              <div>
                <div className="text-sm font-semibold">{person_name}</div>
                <div className="text-xs text-muted">{person_email}</div>
              </div>
            </div>
          );
        },
      },
      {
        id: "person_mobile",
        header: "Phone Number",
        accessorFn: (row) => row.person?.person_mobile,
        enableSorting: true,
        cell: ({ row }) => {
          const mobile = row.original.person?.person_mobile;
          const countryCode = row.original.person?.country_code;
          return mobile ? `+${countryCode} ${mobile}` : "—";
        },
      },
      {
        id: "person_add_date",
        header: "Created Date",
        accessorFn: (row) => row.person?.person_add_date,
        enableSorting: true,
        cell: ({ row }) => {
          const date = row.original.person?.person_add_date;
          return date ? new Date(date).toLocaleDateString() : "—";
        },
        meta: { className: "min-w-[190px]" },
      },
      {
        id: "person_status",
        header: "Status",
        accessorFn: (row) => row.person?.person_status,
        enableSorting: true,
        cell: ({ row }) => {
          const person_status = row.original.person?.person_status;
          const color =
            person_status === 1
              ? "success"
              : person_status === 0
                ? "danger"
                : "warning";
          return (
            <span className={`badge badge-${color} badge-outline capitalize`}>
              {person_status === 1
                ? "Active"
                : person_status === 0
                  ? "Inactive"
                  : "Blocked"}
            </span>
          );
        },
        meta: { className: "min-w-[102px]" },
      },
    ],
    []
  );

  // Fetch team members for this role
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
        navigate("/auth/login");
        return { data: [], totalCount: 0 };
      }

      const sort = sorting?.[0]?.id;
      const sortDirection = sorting?.[0]?.desc ? "-" : "";

      let url = `${import.meta.env.VITE_APP_API_URL}/team/list?perPage=${pageSize}&page=${pageIndex + 1}&filter[status]=1&filter[group_uid]=${roleId}`;

      if (sort) {
        url += `&sort=${sortDirection}${sort}`;
      }

      console.log("Fetching team members URL:", url);

      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const members = res.data?.data ?? [];
      const total = res.data?.pagination?.total ?? 0;

      setTotalCount(total);
      console.log("Team members:", members);

      return { data: members, totalCount: total };
    } catch (err) {
      console.error("❌ Error fetching team members:", err);
      return { data: [], totalCount: 0 };
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Edit Role: {role?.name}</h3>
      </div>
      <div className="card-body">
        <form onSubmit={formik.handleSubmit}>
          {/* Role Name */}
          <div className="mb-6 ">
            <label className="form-label">Role Name</label>
            <input
              type="text"
              className={`input ${formik.touched.role_name && formik.errors.role_name ? "is-invalid" : ""}`}
              name="role_name"
              value={formik.values.role_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter role name"
            />
            {formik.touched.role_name && formik.errors.role_name && (
              <div className="invalid-feedback">{formik.errors.role_name}</div>
            )}
          </div>

          {/* Permissions */}
          <div className="mb-6">
            <h4 className="mb-4">Permissions</h4>
            <div className="overflow-x-auto">
              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th className="text-left">Module</th>
                    {[
                      "Menu Access",
                      "View List",
                      "Add New",
                      "Edit",
                      "Delete",
                      "View Details",
                      "Invoice Access",
                    ].map((label) => (
                      <th key={label} className="text-center">
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissionSections.map((section) => (
                    <tr key={section.key}>
                      <td className="font-medium">{section.title}</td>
                      {[
                        "menu",
                        "list",
                        "add",
                        "edit",
                        "delete",
                        "view",
                        "invoice",
                      ].map((perm) => {
                        const fieldName = `${section.key}_${perm}`;
                        const hasPermission =
                          section.permissions.includes(perm);

                        if (!hasPermission) {
                          return (
                            <td key={perm} className="text-center">
                              -
                            </td>
                          );
                        }

                        return (
                          <td key={perm} className="text-center">
                            <label className="flex switch items-center justify-center cursor-pointer">
                              <input
                                type="checkbox"
                                id={fieldName}
                                name={fieldName}
                                checked={formik.values[fieldName] || false}
                                onChange={formik.handleChange}
                                className="toggle toggle-sm"
                              />
                            </label>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate("/Teams?tab=roles")}
              className="btn btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Role"}
            </button>
          </div>
        </form>
        <div>
          {/* Team Members Table */}
          <div className="mt-8">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Team Members with this Role</h3>
                <div className="card-toolbar">
                  <span className="text-sm text-muted">
                    Showing {totalCount} member{totalCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
              <div className="card-body">
                <DataGrid
                  key={refetchKey}
                  columns={columns}
                  serverSide
                  onFetchData={fetchTeamMembers}
                  isLoading={loading}
                  pagination={{
                    page: pageIndex,
                    size: pageSize,
                    onPageChange: setPageIndex,
                    onPageSizeChange: setPageSize,
                  }}
                />
                {loading && (
                  <div className="absolute inset-0 bg-black/5 backdrop-blur-[1px] flex items-center justify-center">
                    <div className="flex items-center gap-2 px-4 py-2 dark:bg-black/50 bg-white/90 rounded-lg shadow-lg">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium text-gray-700">
                        Loading team members...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

RoleProfileContent.propTypes = {
  roleId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  role: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    users_count: PropTypes.number,
    permissions: PropTypes.object,
  }),
};
export { RoleProfileContent };
