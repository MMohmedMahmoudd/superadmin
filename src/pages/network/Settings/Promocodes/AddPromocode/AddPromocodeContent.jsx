import { useState } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { PersonNameSelect } from './PersonNameSelect';

const AddPromocodeContent = () => {
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const formik = useFormik({
    initialValues: {
      service_type: '',
      code: '',
      type: '',
      percentage: '',
      one_time: '',
      using_limit: '',
      using_count: '',
      status: '',
      user_id: '',
    },
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
        const data = new FormData();
        Object.entries(values).forEach(([key, val]) => {
          data.append(key, String(val));
        });

        const storedAuth = localStorage.getItem(
          import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION
        );
        const authData = storedAuth ? JSON.parse(storedAuth) : null;
        const token = authData?.access_token;

        if (!token) {
          enqueueSnackbar('Authentication token not found. Please log in.', { variant: 'error' });
          navigate('/auth/login');
          return;
        }

        const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/promocodes`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        enqueueSnackbar('Promocode created successfully!', { variant: 'success' });
        formik.resetForm();
        navigate('/promocodes');
      } catch (error) {
        const responseErrors = error?.response?.data?.errors || {};
        setErrors(responseErrors);
        const errorMessage =
          error?.response?.data?.message ||
          Object.values(responseErrors)[0]?.[0] ||
          'Something went wrong. Please try again.';
        enqueueSnackbar(errorMessage, { variant: 'error' });
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="card col-span-4 ">
      <div className="card-header">
        <h3 className='card-title'>Add Promocode</h3>
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

          <div className="form-group col-span-1 md:col-span-2">
            <PersonNameSelect formik={formik} />
          </div>

          <div className="form-group col-span-1 md:col-span-2 flex justify-end">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { AddPromocodeContent };