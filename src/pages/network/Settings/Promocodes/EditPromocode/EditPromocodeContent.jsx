import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
// import { PersonNameSelect } from './PersonNameSelect'; // Uncomment if you have this component for user_id

function EditPromocodeContent({ categoryData }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      service_type: categoryData?.service_type?.toString() || '',
      code: categoryData?.code || '',
      type: categoryData?.type || '',
      percentage: categoryData?.percentage?.toString() || '',
      one_time: categoryData?.one_time?.toString() || '',
      using_limit: categoryData?.using_limit?.toString() || '',
      using_count: categoryData?.using_count?.toString() || '',
      status: categoryData?.status?.toString() || '',
      user_id: categoryData?.user_id?.toString() || '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      service_type: Yup.string().required('Service type is required'),
      code: Yup.string().required('Code is required'),
      type: Yup.string().required('Type is required'),
      percentage: Yup.number().typeError('Percentage must be a number').required('Percentage is required'),
      one_time: Yup.string().required('One time is required'),
      using_limit: Yup.number().typeError('Using limit must be a number').required('Using limit is required'),
      using_count: Yup.number().typeError('Using count must be a number').required('Using count is required'),
      status: Yup.string().required('Status is required'),
      user_id: Yup.string().required('User is required'),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const storedAuth = localStorage.getItem(import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION);
        const authData = storedAuth ? JSON.parse(storedAuth) : null;
        const token = authData?.access_token;

        if (!token) {
          enqueueSnackbar('Authentication token not found.', { variant: 'error' });
          navigate('/auth/login');
          return;
        }

        const formData = new FormData();
        for (const key in values) {
          if (values[key] !== null && values[key] !== undefined) {
            formData.append(key, values[key]);
          }
        }
        formData.append('_method', 'PUT');
        const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/promocodes/${categoryData.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        if (response.data.success) {
          enqueueSnackbar('Promocode updated successfully!', { variant: 'success' });
          navigate('/promocodes');
        } else {
          enqueueSnackbar(response.data.message || 'Failed to update promocode', { variant: 'error' });
        }
      } catch (error) {
        enqueueSnackbar(error.response?.data?.message || 'Error updating promocode', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="card col-span-4">
      <div className="card-header">
        <h3 className='card-title'>Edit Promocode: {categoryData?.code}</h3>
      </div>
      <div className="card-body">
        <form className="w-full grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={formik.handleSubmit}>
          <div className="form-group col-span-1">
            <label className="form-label">Service Type</label>
            <select
              name="service_type"
              className="select input"
              value={formik.values.service_type}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="">Select Service Type</option>
              <option value="1">Subscription</option>
              <option value="2">Booking</option>
            </select>
            {formik.touched.service_type && formik.errors.service_type && (
              <div className="text-red-500 text-xs">{formik.errors.service_type}</div>
            )}
          </div>

          <div className="form-group col-span-1">
            <label className="form-label">Code</label>
            <input
              type="text"
              name="code"
              className="input"
              value={formik.values.code}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.code && formik.errors.code && (
              <div className="text-red-500 text-xs">{formik.errors.code}</div>
            )}
          </div>

          <div className="form-group col-span-1">
            <label className="form-label">Type</label>
            <select
              name="type"
              className="select"
              value={formik.values.type}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="">Select Type</option>
              <option value="percentage">Percentage</option>
              {/* <option value="fixed">Fixed</option> */}
            </select>
            {formik.touched.type && formik.errors.type && (
              <div className="text-red-500 text-xs">{formik.errors.type}</div>
            )}
          </div>

          <div className="form-group col-span-1">
            <label className="form-label">Percentage</label>
            <input
              type="number"
              name="percentage"
              className="input"
              value={formik.values.percentage}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.percentage && formik.errors.percentage && (
              <div className="text-red-500 text-xs">{formik.errors.percentage}</div>
            )}
          </div>

          <div className="form-group col-span-1">
            <label className="form-label">One Time</label>
            <select
              name="one_time"
              className="select"
              value={formik.values.one_time}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="">Select</option>
              <option value="0">No</option>
              <option value="1">Yes</option>
            </select>
            {formik.touched.one_time && formik.errors.one_time && (
              <div className="text-red-500 text-xs">{formik.errors.one_time}</div>
            )}
          </div>

          <div className="form-group col-span-1">
            <label className="form-label">Using Limit</label>
            <input
              type="number"
              name="using_limit"
              className="input"
              value={formik.values.using_limit}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.using_limit && formik.errors.using_limit && (
              <div className="text-red-500 text-xs">{formik.errors.using_limit}</div>
            )}
          </div>

          <div className="form-group col-span-1">
            <label className="form-label">Using Count</label>
            <input
              type="number"
              name="using_count"
              className="input"
              value={formik.values.using_count}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.using_count && formik.errors.using_count && (
              <div className="text-red-500 text-xs">{formik.errors.using_count}</div>
            )}
          </div>

          <div className="form-group col-span-1">
            <label className="form-label">Status</label>
            <select
              name="status"
              className="select"
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            >
              <option value="">Select Status</option>
              <option value="1">Active</option>
              <option value="2">Inactive</option>
            </select>
            {formik.touched.status && formik.errors.status && (
              <div className="text-red-500 text-xs">{formik.errors.status}</div>
            )}
          </div>

          {/*
          <div className="form-group col-span-1 md:col-span-2">
            <PersonNameSelect formik={formik} />
          </div>
          */}
          <div className="form-group col-span-1 md:col-span-2">
            <label className="form-label">User ID</label>
            <input
              type="text"
              name="user_id"
              className="input"
              value={formik.values.user_id}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.user_id && formik.errors.user_id && (
              <div className="text-red-500 text-xs">{formik.errors.user_id}</div>
            )}
          </div>

          <div className="form-group col-span-1 md:col-span-2 flex justify-end">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Promocode'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

EditPromocodeContent.propTypes = {
  categoryData: PropTypes.object,
};

export { EditPromocodeContent };