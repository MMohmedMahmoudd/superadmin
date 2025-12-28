import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types';
import * as Yup from 'yup';
import { CountrySelect } from '../../../Locations/Cities/AddCity/CountrySelect';

function EditCurrencyContent({ currencyData }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      title: currencyData?.title || '',
      rate: currencyData?.rate || '',
      country_id: currencyData?.country_id?.toString() || '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      title: Yup.string().required('Currency title is required'),
      rate: Yup.string().required('Rate is required'),
      country_id: Yup.string().required('Country is required'),
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
        const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/currencies/${currencyData.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        if (response.data.success) {
          enqueueSnackbar(`Currency updated successfully!`, { variant: 'success' });
          navigate('/currencies');
        } else {
          enqueueSnackbar(response.data.message || 'Failed to update currency', { variant: 'error' });
        }
      } catch (error) {
        enqueueSnackbar(error.response?.data?.message || 'Error updating currency', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    },
  });

  return (
    <div className="card col-span-4">
      <div className="card-header">
        <h3 className='card-title'>Edit Currency: {currencyData?.title}</h3>
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
              {loading ? 'Updating...' : 'Update Currency'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

EditCurrencyContent.propTypes = {
  currencyData: PropTypes.object,
};

export { EditCurrencyContent };