import { useState } from 'react';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CountrySelect } from './CountrySelect';
import {CrudAvatarUpload} from './CrudAvatarUpload'
const AddCityContent = () => {
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const formik = useFormik({
    initialValues: {
    // Step 1
    city_name_en: '',
    city_name_ar: '',
    country_uid: '',
    city_image: ''
      // Add other fields here...
    },
    validationSchema: Yup.object({
        // Step 1
        city_name_en: Yup.string().required('City name in English is required'),
        city_name_ar: Yup.string().required('City name in Arabic is required'),
        country_uid: Yup.string().required('Country is required'),
        city_image:Yup.string().required('City Image is required')
        }),
    onSubmit: (values) => {
      console.log('Form submitted:', values);
      // your submission logic here
    },
  });
  
  // const handleFileChange = (file) => {
  //   formik.setFieldValue('image', file);
  // };
  

  
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
      });
  
      const token = JSON.parse(localStorage.getItem(
        import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION
      ))?.access_token;
  
      const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/city/create`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      console.log('✅ Provider Created:', response.data);
      enqueueSnackbar('Provider created successfully!', { variant: 'success' });
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
      <CrudAvatarUpload onFileChange={handleFileChange} />
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
  );
};

export  {AddCityContent};