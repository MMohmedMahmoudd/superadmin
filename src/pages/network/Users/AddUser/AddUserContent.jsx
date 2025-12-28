import { useState } from 'react';
import axios from 'axios';
import clsx from 'clsx';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import MuiPhoneInput from './MuiPhoneInput';
import { CrudAvatarUpload } from './CrudAvatarUpload';

const AddUserContent = () => {
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [mobileInput, setMobileInput] = useState('');
  
  const formik = useFormik({
    initialValues: {
      // Step 1
      person_image: "",
      person_status: '',
      person_name: '',
      person_email: '',
      person_password: '',
      person_mobile: '',
      country_code: '', 
    },
    validationSchema: Yup.object({
      // Step 1
      person_name: Yup.string().required('Name is required'),
      person_email: Yup.string().email('Invalid email').required('Email is required'),
      person_password: Yup.string().min(6).required('Password is required'),
      person_mobile: Yup.string()
        .required('Mobile number is required')
        .matches(/^\d+$/, 'Must be numeric only'), // ensures it's numbers only
      country_code: Yup.string()
        .required('Country code is required')
        .max(5, 'Too long'), // allows codes like '+966', '+1234'
      person_status: Yup.string().required('Status is required'),
    }),
    onSubmit: (values) => {
      console.log('Form submitted:', values);
      // your submission logic here
    },
  });
  
  const handleFileChange = (file) => {
    formik.setFieldValue('person_image', file);
  };
  
  const togglePassword = event => {
    event.preventDefault();
    setShowPassword(!showPassword);
  };

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
      
      // Set user type - customers
      data.append('is_customer', '1');
      data.append('is_provider', '0');
  
      const token = JSON.parse(localStorage.getItem(
        import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION
      ))?.access_token;
  
      const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/user/create`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Check if the API response indicates success or failure
      if (response.data.success === false) {
        // Handle validation errors
        enqueueSnackbar(response.data.message, { variant: 'error' });
        setErrors(response.data.data);
        return;
      }

      // Success case
      console.log('✅ User Created:', response.data);
      enqueueSnackbar('User created successfully!', { variant: 'success' });
      navigate('/Users');
  
    } catch (error) {
      console.error('❌ Submission failed:', error);
      
      // Clear any previous errors
      setErrors({});
      
      // Fix: The API returns errors in the 'data' field, not 'errors' field
      const responseErrors = error?.response?.data?.data || {};
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
  
  return (
    <form className="w-full" onSubmit={formik.handleSubmit}>
      {/* Stepper Body */}
      <div className="card-body p-1">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="parent-cruds xl:col-span-1 col-span-3 card p-6">
            <div className="flex justify-center items-center dark:bg-gray-200 bg-gray-100 rounded-lg py-4 flex-col gap-y-4 mb-4">
              <label className="block text-sm font-medium mb-1">User Logo</label> 
              <CrudAvatarUpload onFileChange={handleFileChange} />
              {errors.person_image && <p className="text-red-500 text-sm mt-1">{errors.person_image[0]}</p>}
              <p className="text-sm text-center text-gray-500 mt-1">Only *.png, *.jpg, and *.jpeg image files are accepted.</p>
            </div>
            
            <div className="card px-3 py-3">
              <label className="form-label mb-1">Status</label>
              <select
                className="select"
                {...formik.getFieldProps('person_status')}
              >
                <option value="">Select status</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
                <option value="3">Waiting Confirmation</option>
              </select>
              {formik.touched.person_status && formik.errors.person_status && (
                <span role="alert" className="text-danger text-xs mt-1">{formik.errors.person_status}</span>
              )}
              {/* Show server-side validation errors */}
              {errors.person_status && (
                <span role="alert" className="text-danger text-xs mt-1">{errors.person_status[0]}</span>
              )}
            </div>
          </div>

          {/* Basic Information Card */}
          <div className="col-span-3 xl:col-span-2 card p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">User Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="form-label mb-1">Name</label>
                <input
                  className="input"
                  {...formik.getFieldProps('person_name')}
                />
                {formik.touched.person_name && formik.errors.person_name && (
                  <p className="text-red-500 text-xs mt-1">{formik.errors.person_name}</p>
                )}
                {/* Show server-side validation errors */}
                {errors.person_name && (
                  <p className="text-red-500 text-xs mt-1">{errors.person_name[0]}</p>
                )}
              </div>
              
              <div>
                <label className="form-label mb-1">Email</label>
                <input
                  className="input"
                  {...formik.getFieldProps('person_email')}
                />
                {formik.touched.person_email && formik.errors.person_email && (
                  <p className="text-red-500 text-xs mt-1">{formik.errors.person_email}</p>
                )}
                {/* Show server-side validation errors */}
                {errors.person_email && (
                  <p className="text-red-500 text-xs mt-1">{errors.person_email[0]}</p>
                )}
              </div>
              
              <div>
                <label className="form-label mb-2">Phone Number</label>
                <MuiPhoneInput
                  value={mobileInput}
                  onChange={(value) => {
                    setMobileInput(value);
                    const country_code = mobileInput.match(/^(\+)?(\d{1,4})/)?.[2] || '';
                    const mobile = mobileInput.replace(/^(\+)?\d{1,4}\s*/, '').replace(/\s+/g, '');
                    formik.setFieldValue('country_code', country_code);
                    formik.setFieldValue('person_mobile', mobile);
                  }}
                />
                {formik.touched.person_mobile && formik.errors.person_mobile && (
                  <p className="text-red-500 text-xs mt-1">{formik.errors.person_mobile}</p>
                )}
                {/* Show server-side validation errors */}
                {errors.person_mobile && (
                  <p className="text-red-500 text-xs mt-1">{errors.person_mobile[0]}</p>
                )}
                {formik.touched.country_code && formik.errors.country_code && (
                  <p className="text-red-500 text-xs mt-1">{formik.errors.country_code}</p>
                )}
                {/* Show server-side validation errors */}
                {errors.country_code && (
                  <p className="text-red-500 text-xs mt-1">{errors.country_code[0]}</p>
                )}
              </div>

              <div>
                <label className="form-label mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="off"
                    {...formik.getFieldProps('person_password')}
                    className={clsx('input w-full pr-10', {
                      'border-red-500': formik.touched.person_password && formik.errors.person_password
                    })}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={togglePassword}
                    tabIndex={-1}
                  >
                    <i className={clsx('ki-filled ki-eye', { hidden: showPassword })}></i>
                    <i className={clsx('ki-filled ki-eye-slash', { hidden: !showPassword })}></i>
                  </button>
                </div>
                {formik.touched.person_password && formik.errors.person_password && (
                  <span role="alert" className="text-danger text-xs mt-1">{formik.errors.person_password}</span>
                )}
                {/* Show server-side validation errors */}
                {errors.person_password && (
                  <span role="alert" className="text-danger text-xs mt-1">{errors.person_password[0]}</span>
                )}
              </div>

              <div className="col-span-2">
                <div className="flex justify-end mt-4">
                  <button
                    type="button"
                    className="btn bg-gradient-primary -translate-x-2 hover:translate-x-0 outline-0 border-0 text-white"
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
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
};

export { AddUserContent };