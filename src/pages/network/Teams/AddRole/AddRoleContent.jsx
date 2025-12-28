import { useState } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const AddRoleContent = () => {
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  // Permission sections configuration - using flattened keys as per API
  const permissionSections = [
    {
      title: 'Service Types',
      key: 'sp_type',
      permissions: ['menu', 'list', 'add', 'edit', 'delete']
    },
    {
      title: 'Main Services',
      key: 'sp_main',
      permissions: ['menu', 'list', 'add', 'edit', 'delete', 'view']
    },
    {
      title: 'Categories',
      key: 'sp_categories',
      permissions: ['menu', 'list', 'add', 'edit', 'view', 'delete']
    },
    {
      title: 'Branches',
      key: 'sp_branches',
      permissions: ['menu', 'list', 'add', 'edit', 'delete']
    },
    {
      title: 'Cities',
      key: 'cities',
      permissions: ['menu', 'list', 'add', 'edit', 'delete']
    },
    {
      title: 'Zones',
      key: 'zones',
      permissions: ['menu', 'list', 'add', 'edit', 'delete']
    },
    {
      title: 'Countries',
      key: 'countries',
      permissions: ['menu', 'list', 'add', 'edit', 'delete']
    },
    {
      title: 'Bookings',
      key: 'bookings',
      permissions: ['menu', 'list', 'add', 'edit', 'delete', 'invoice_view']
    },
    {
      title: 'Notifications',
      key: 'notifications',
      permissions: ['menu', 'list', 'add', 'delete']
    },
    {
      title: 'Logs',
      key: 'log',
      permissions: ['menu', 'list', 'delete']
    },
    {
      title: 'Admins',
      key: 'admins',
      permissions: ['menu', 'list', 'add', 'edit', 'delete']
    },
    {
      title: 'Groups',
      key: 'groups',
      permissions: ['menu', 'list', 'add', 'edit', 'delete']
    },
    {
      title: 'Promo Codes',
      key: 'promo_codes',
      permissions: ['menu', 'list', 'add', 'edit', 'delete']
    },
    {
      title: 'Settings',
      key: 'settings',
      permissions: ['menu', 'list', 'edit']
    },
    {
      title: 'Staff',
      key: 'stuff',
      permissions: ['menu', 'list', 'add', 'edit', 'del']
    }
  ];

  const getPermissionLabel = (perm) => {
    const labels = {
      menu: 'Menu Access',
      list: 'View List',
      add: 'Add New',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View Details',
      invoice: 'Invoice Access'
    };
    return labels[perm] || perm;
  };

  // Initialize form with all permissions set to false
  const initializePermissions = () => {
    const permissions = {};
    permissionSections.forEach(section => {
      section.permissions.forEach(perm => {
        permissions[`${section.key}_${perm}`] = false;
      });
    });
    return permissions;
  };

  const formik = useFormik({
    initialValues: {
      group_name: '',
      ...initializePermissions()
    },
    validationSchema: Yup.object({
      group_name: Yup.string().required('Role name is required'),
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        setLoading(true);
        
        const errors = await formik.validateForm();
        if (Object.keys(errors).length > 0) {
          enqueueSnackbar('Please fix the errors before submitting.', { variant: 'error' });
          return;
        }

        const token = JSON.parse(localStorage.getItem(
          import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION
        ))?.access_token;

        if (!token) {
          enqueueSnackbar('Authentication token not found', { variant: 'error' });
          return;
        }

        const formData = new FormData();
        
        // Add role name
        formData.append('group_name', values.group_name);
        
        // Add permissions
        Object.entries(values).forEach(([key, value]) => {
          if (key !== 'group_name') {
            formData.append(key, value ? 1 : 0);
          }
        });

        const response = await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/roles`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
          }
        );

                  if (response.data.success) {
            enqueueSnackbar('Role created successfully!', { variant: 'success' });
            navigate('/Teams?tab=roles');
          } else {
          enqueueSnackbar(response.data.message || 'Failed to create role', { variant: 'error' });
        }

      } catch (error) {
        const msg = error?.response?.data?.message || 'Failed to create role.';
        enqueueSnackbar(msg, { variant: 'error' });
      } finally {
        setLoading(false);
        setSubmitting(false);
      }
    }
  });
  
  

  
  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Create New Role</h3>
      </div>
      <div className="card-body">
        <form onSubmit={formik.handleSubmit}>
          {/* Role Name */}
          <div className="mb-6">
            <label className="form-label">Role Name</label>
            <input
              type="text"
              className={`input ${formik.touched.group_name && formik.errors.group_name ? 'is-invalid' : ''}`}
              name="group_name"
              value={formik.values.group_name}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Enter role name"
            />
            {formik.touched.group_name && formik.errors.group_name && (
              <div className="invalid-feedback">{formik.errors.group_name}</div>
            )}
          </div>

          {/* Permissions */}
          <div className="mb-6">
            <h4 className="mb-4">Permissions</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
              {permissionSections.map((section) => (
                <div key={section.key} className="card card-sm">
                  <div className="card-header">
                    <h5 className="card-title text-sm">{section.title}</h5>
                  </div>
                  <div className="card-body">
                    <div className="space-y-6">
                      {section.permissions.map((perm) => {
                        const fieldName = `${section.key}_${perm}`;
                        return (
                          <div key={perm} className="flex items-center">
                            <label className="flex switch items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                id={fieldName}
                                name={fieldName}
                                checked={formik.values[fieldName] || false}
                                onChange={formik.handleChange}
                                className="toggle toggle-sm"
                              />
                              <span className="text-sm">{getPermissionLabel(perm)}</span>
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => navigate('/Teams?tab=roles')}
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
              {loading ? 'Creating...' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export  {AddRoleContent};