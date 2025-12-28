import { useState, useEffect } from 'react';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CountrySelect } from './CountrySelect';
import {CrudAvatarUpload} from './CrudAvatarUpload'
import { useParams } from 'react-router-dom';

const EditCityContent = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [initialLoading, setInitialLoading] = useState(true);

  const formik = useFormik({
    initialValues: {
      city_name_en: '',
      city_name_ar: '',
      country_uid: '',
      city_image: ''
    },
    validationSchema: Yup.object({
      city_name_en: Yup.string().required('City name in English is required'),
      city_name_ar: Yup.string().required('City name in Arabic is required'),
      country_uid: Yup.string().required('Country is required'),
      city_image: Yup.string().required('City Image is required')
    }),
    onSubmit: (values) => {
      console.log('Form submitted:', values);
    },
  });

  useEffect(() => {
    const fetchCityData = async () => {
      try {
        setInitialLoading(true);
        const token = JSON.parse(localStorage.getItem(
          import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION
        ))?.access_token;

        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/cities/list?filter[city_uid]=${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success && response.data.data.length > 0) {
          const cityData = response.data.data[0];
          formik.setValues({
            city_name_en: cityData.name,
            city_name_ar: cityData.name_ar || cityData.name, // Assuming Arabic name might be in name_ar or name
            country_uid: cityData.country.id.toString(),
            city_image: cityData.image
          });
        } else {
            enqueueSnackbar('City not found or data is empty.', { variant: 'warning' });
        }
      } catch (error) {
        console.error('Error fetching city data:', error);
        enqueueSnackbar('Failed to load city data', { variant: 'error' });
      } finally {
        setInitialLoading(false);
      }
    };

    fetchCityData();
  }, [id]);

  const handleSubmit = async () => {
    try {
      // Run validation first
      const errors = await formik.validateForm();
  
      if (Object.keys(errors).length > 0) {
        formik.setTouched(
          Object.keys(errors).reduce((acc, key) => {
            acc[key] = true;
            return acc;
          }, {}),
          true
        );
        enqueueSnackbar('Please complete all required fields.', { variant: 'error' });
        return;
      }
  
      setLoading(true);
  
      const data = new FormData();
      Object.entries(formik.values).forEach(([key, val]) => {
        data.append(key, val);
        data.append('_method', 'PUT');

      });
  
      const token = JSON.parse(localStorage.getItem(
        import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION
      ))?.access_token;
  
      const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/city/${id}/update`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      console.log('✅ Provider Created:', response.data);
      enqueueSnackbar('City Edited successfully!', { variant: 'success' });
      navigate('/cities');
  
    } catch (error) {
      console.error('❌ Submission failed:', error);
      const responseErrors = error?.response?.data?.errors || {};
      setErrors(responseErrors); // field-level fallback
  
      const errorMessage =
        error?.response?.data?.message ||
        Object.values(responseErrors)[0]?.[0] ||
        'Something went wrong. Please try again.';
  
      enqueueSnackbar(errorMessage, { variant: 'error' });
  
    } finally {
      setLoading(false);
    }
  };
  const handleFileChange = (file) => {
    console.log("Selected file:", file);
    formik.setFieldValue('city_image', file);
  };

  return (
    <div>
      {initialLoading ? (
      <div className="flex justify-center items-center min-h-[200px]">
      <div className="inline-block h-6 w-6 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent" />
    </div>
    ) : (
        <form className="w-full" onSubmit={formik.handleSubmit}>
          {/* Dashed Line Separator Between Steps */}

          {/* Stepper Body */}
          <div className="card-body p-1 ">
            <div  className="grid grid-cols-1 xl:grid-cols-1 gap-4">

              {/* Basic Information Card */}
              <div className="col-span-1 xl:col-span-2 card p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <div className=" flex justify-center items-center dark:bg-gray-200 bg-gray-100 rounded-lg py-4 flex-col gap-y-4 mb-4">
                      <label className="block text-sm font-medium mb-1">Provider Logo  </label> 
                      <CrudAvatarUpload onFileChange={handleFileChange} avatarURL={formik.values.city_image} />
                      {errors.sp_image && <p className="text-red-500 text-sm mt-1">{errors.sp_image}</p>}

                      <p className="text-sm text-center text-gray-500 mt-1">Only *.png, *.jpg, and *.jpeg image files are accepted.</p>
                    </div>

                  </div>
                  <div className="col-span-2 ">
                    <CountrySelect formik={formik} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="form-label mb-1">City Name (English)</label>
                    <input
                      type="text"
                      className="input bg-transparent"
                      {...formik.getFieldProps('city_name_en')}
                    />
                    {formik.touched.city_name_en && formik.errors.city_name_en && (
                      <p className="text-red-500 text-xs mt-1">{formik.errors.city_name_en}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="form-label mb-1">City Name (Arabic)</label>
                    <input
                      type="text"
                      className="input bg-transparent"
                      {...formik.getFieldProps('city_name_ar')}
                      dir="rtl"
                    />
                    {formik.touched.city_name_ar && formik.errors.city_name_ar && (
                      <p className="text-red-500 text-xs mt-1">{formik.errors.city_name_ar}</p>
                    )}
                  </div>


                </div>
              </div>
              {/* Business Information Card */}
            </div>
          </div>
          {/* Footer Buttons */}
          <div className="card-footer py-8 flex justify-end">
            <button
              type="button"
              className="btn btn-success"
              disabled={loading}
              onClick={() => {
                formik.validateForm().then(errors => {
                  if (Object.keys(errors).length === 0) {
                    handleSubmit(); // If valid
                  } else {
                    enqueueSnackbar('Please complete all required fields.', { variant: 'error' });

                    // Touch all fields to show errors
                    Object.keys(errors).forEach((key) => {
                      formik.setFieldTouched(key, true);
                    });
                  }
                });
              }}
            >
              {loading ? 'Saving...' : 'Submit'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export  {EditCityContent};