import { useState } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CountrySelect } from '../../../Locations/Cities/AddCity/CountrySelect';

const AddCurrencyContent = () => {
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const formik = useFormik({
    initialValues: {
      title: '',
      rate: '',
      country_id: '',
    },
    validationSchema: Yup.object({
      title: Yup.string().required('Currency title is required'),
      rate: Yup.string().required('Rate is required'),
      country_id: Yup.string().required('Country is required'),
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

        const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/currencies`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        enqueueSnackbar('Currency created successfully!', { variant: 'success' });
        formik.resetForm();
        navigate('/currencies');
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
        <h3 className='card-title'>Add Currency</h3>
      </div>
      <div className="card-body">
        <form className="w-full grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={formik.handleSubmit}>
          <div className="form-group col-span-1">
            <label htmlFor="title" className="form-label">Currency Title</label>
            <input
              type="text"
              id="title"
              className={`input ${formik.touched.title && formik.errors.title ? 'is-invalid' : ''}`}
              {...formik.getFieldProps('title')}
            />
            {formik.touched.title && formik.errors.title && (
              <p role="alert" className="text-danger text-xs mt-1">{formik.errors.title}</p>
            )}
          </div>

          <div className="form-group col-span-1">
            <label htmlFor="rate" className="form-label">Rate</label>
            <input
              type="text"
              id="rate"
              className={`input ${formik.touched.rate && formik.errors.rate ? 'is-invalid' : ''}`}
              {...formik.getFieldProps('rate')}
            />
            {formik.touched.rate && formik.errors.rate && (
              <p role="alert" className="text-danger text-xs mt-1">{formik.errors.rate}</p>
            )}
          </div>

          <div className="form-group col-span-1 md:col-span-2">
            <CountrySelect
              formik={formik}
              fieldName="country_id"
              label="Country"
              placeholder="Select Country"
            />
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

export { AddCurrencyContent };