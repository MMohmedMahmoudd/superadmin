import { useState } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const AddBundlesContent = () => {
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const formik = useFormik({
    initialValues: {
    // Step 1
      bundle_name: '',
      bundle_comission: '',
      bundle_usage_time: '',
      bundle_duration: '',

      // Add other fields here...
    },
    validationSchema: Yup.object({
        // Step 1

      bundle_name: Yup.string()
        .required('Bundle name is required')
        .min(3, 'Bundle name must be at least 3 characters long') 
        .max(50, 'Bundle name must be at most 50 characters long'),
      bundle_comission: Yup.number()
        .required('Bundle percentage is required')
        .min(0, 'Bundle percentage must be a positive number')
        .max(100, 'Bundle percentage must be at most 100')
        .typeError('Bundle percentage must be a number'),
      bundle_usage_time: Yup.number()
        .required('Usage limit is required')
        .min(0, 'Usage limit must be a positive number')
        .typeError('Usage limit must be a number'),
      bundle_duration: Yup.number()
        .required('Duration is required')
        .min(1, 'Duration must be at least 1 day')
        .typeError('Duration must be a number'),
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

        const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/bundles`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('✅ Bundles Created:', response.data);
        enqueueSnackbar('Bundle created successfully!', { variant: 'success' });
        navigate('/Bundles');

        formik.resetForm();

      } catch (error) {
        console.error('❌ Submission failed:', error);
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
      <h3 className='card-title'>Bundle Information</h3>
    </div>
    <div className="card-body">
      <form className="w-full grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={formik.handleSubmit}>
        <div className="form-group col-span-1">
          <label htmlFor="bundle_name" className="form-label">Name</label>
          <input
            type="text"
            id="bundle_name"
            className={`input ${formik.touched.bundle_name && formik.errors.bundle_name ? 'is-invalid' : ''}`}
            {...formik.getFieldProps('bundle_name')}
          />
          {formik.touched.bundle_name && formik.errors.bundle_name ? (
            <p role="alert" className="text-danger text-xs mt-1">{formik.errors.bundle_name}</p>
          ) : null}
        </div>

        <div className="form-group col-span-1">
          <label htmlFor="bundle_usage_time" className="form-label">Usage Limit</label>
          <input
            type="number"
            id="bundle_usage_time"
            className={`input ${formik.touched.bundle_usage_time && formik.errors.bundle_usage_time ? 'is-invalid' : ''}`}
            {...formik.getFieldProps('bundle_usage_time')}
          />
          {formik.touched.bundle_usage_time && formik.errors.bundle_usage_time ? (
            <p role="alert" className="text-danger text-xs mt-1">{formik.errors.bundle_usage_time}</p>
          ) : null}
        </div>

        <div className="form-group col-span-1">
          <label htmlFor="bundle_duration" className="form-label">Duration</label>
          <input
            type="number"
            id="bundle_duration"
            className={`input ${formik.touched.bundle_duration && formik.errors.bundle_duration ? 'is-invalid' : ''}`}
            {...formik.getFieldProps('bundle_duration')}
          />
          {formik.touched.bundle_duration && formik.errors.bundle_duration ? (
            <p role="alert" className="text-danger text-xs mt-1">{formik.errors.bundle_duration}</p>
          ) : null}
        </div>

        <div className="form-group col-span-1">
          <label htmlFor="bundle_comission" className="form-label">Percentage</label>
          <input
            type="number"
            id="bundle_comission"
            className={`input ${formik.touched.bundle_comission && formik.errors.bundle_comission ? 'is-invalid' : ''}`}
            {...formik.getFieldProps('bundle_comission')}
          />
          {formik.touched.bundle_comission && formik.errors.bundle_comission ? (
            <p role="alert" className="text-danger text-xs mt-1">{formik.errors.bundle_comission}</p>
          ) : null}
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

export  {AddBundlesContent};