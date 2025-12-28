import { useFormik } from 'formik';
import * as Yup from 'yup';
import clsx from 'clsx';
import { Tabs,Tab, TabsList, TabPanel } from "@/components/tabs";
import {  useState } from "react";
import MuiPhoneInput from "../../Bussiness/BussinessProfile/MuiPhoneInput";
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useNavigate,Link } from 'react-router-dom';
import axios from 'axios';
import { useEffect } from 'react';
import { forwardRef, useImperativeHandle } from 'react';
import { toAbsoluteUrl } from '@/utils';
const ProfileUserContentComponent = ({ providerId, provider, profileImage, setFormikMeta }, ref) => {
  // everything inside your component logic here
  const [activeTab, setActiveTab] = useState("Information");
  const [showPassword, setShowPassword] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();

  const togglePassword = event => {
    event.preventDefault();
    setShowPassword(showPassword);
  };
  const formik = useFormik({
    enableReinitialize: true, // allow form to refresh when provider data changes
    initialValues: {
      person_name: provider?.name || '',
      person_email: provider?.email || '',
      person_password: '',
      person_image: profileImage || provider?.image || null,
      // store country_code as digits only (no '+') to match API expectation
      country_code: provider?.country_code?.toString().replace('+', '') || '20',
      person_mobile: provider?.mobile || '',
      person_status: provider?.person_status?.toString() || '1',
    },
    
    validationSchema: Yup.object({
      person_name: Yup.string().required('Name is required'),
      person_email: Yup.string().email().required('Email is required'),
      person_mobile: Yup.string().required('Phone is required'),
      country_code: Yup.string().required(),
      person_status: Yup.string().required(),
      person_image: Yup.mixed()
      .test("is-file-or-existing", "Profile image is required", function (value) {
        if (typeof value === "string" && value !== "") return true; // existing image ✅
        if (value instanceof File) return true; // uploaded file ✅
        return false; // ❌ nothing provided
      })
      .test(
        "fileFormat",
        "Unsupported file format. Only jpeg, png, jpg, gif, svg are allowed.",
        value => {
          if (!value || typeof value === "string") return true;
          return ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/svg+xml'].includes(value.type);
        }
      )
                  
    }),
    onSubmit: async (values, { setSubmitting }) => {
      try {
        // Touch all fields to show errors visually
        await formik.setTouched({
          person_name: true,
          person_email: true,
          person_mobile: true,
          country_code: true,
          person_status: true,
          person_image: true,
        });
            
        const errors = await formik.validateForm();
        formik.setTouched({
          ...formik.touched,
          person_image: true
        }, true);
        
        // Force update visible errors
        setFormikMeta({
          errors: formik.errors,
          touched: formik.touched
        });
        
        if (Object.keys(errors).length > 0) {
          enqueueSnackbar('Please fix the errors before submitting.', { variant: 'error' });
          return;
        }
        
        setSubmitting(true);
    
        const token = JSON.parse(localStorage.getItem(
          import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION
        ))?.access_token;
    
        // Always use the latest edited values from Formik
        const formData = new FormData();
        const statusMap = {
          active: 1,
          inactive: 2,
          blocked: 0,
        };

        // Name & email
        formData.append('person_name', values.person_name ?? '');
        formData.append('person_email', values.person_email ?? '');

        // Phone: keep explicit so we never fall back to provider values
        // API expects country_code without '+' and mobile without country code
        formData.append('person_mobile', values.person_mobile ?? '');
        formData.append('country_code', values.country_code ?? '');

        // Password: only send if user typed something, otherwise keep old password
        if (values.person_password && values.person_password.trim() !== '') {
          formData.append('person_password', values.person_password.trim());
        }

        // Status mapping from string to numeric code
        if (values.person_status !== undefined && values.person_status !== null) {
          const statusVal =
            statusMap[String(values.person_status).toLowerCase()] ?? values.person_status;
          formData.append('person_status', statusVal);
        }

        // Image: only send if it's a File (new upload)
        if (values.person_image && typeof values.person_image !== 'string') {
          formData.append('person_image', values.person_image);
        }
    
        formData.append('_method', 'PUT');
        formData.append('is_customer',  1);
        formData.append('is_provider',  0);
        console.log(formData);
        await axios.post(
          `${import.meta.env.VITE_APP_API_URL}/user/${providerId}/update`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
    
        enqueueSnackbar('User updated successfully!', { variant: 'success' });
        navigate('/Users');
    
      } catch (error) {
        const errorMessage = error?.response?.data?.errors?.person_email?.[0] || 'Failed to update user.';
        const msg = errorMessage || 'Failed to update user.';
        enqueueSnackbar(msg, { variant: 'error' });
        enqueueSnackbar(error?.response?.data?.person_email, { variant: 'error' });
      } finally {
        setSubmitting(false);
      }
    }
      });
      useImperativeHandle(ref, () => ({
        getMeta: () => ({ errors: formik.errors, touched: formik.touched }),
        setMeta: () => {
          // Not needed here unless two-way, but needed to expose setMeta() to parent
        }
      }));
            
      useEffect(() => {
        // Set the field with either uploaded image, or existing image, or null
        formik.setFieldValue('person_image', profileImage || provider?.image || null);
      
        // Show snackbar error if nothing exists AND user tried to submit
        if (!profileImage && !provider?.image && formik.submitCount > 0) {
          enqueueSnackbar('Profile image is required', { variant: 'error' });
        }
      }, [profileImage, provider?.image, formik.submitCount]);
                  
  useEffect(() => {
    if (!provider?.providers && activeTab === "Business") {
      setActiveTab("Information");
    }
  }, [provider, activeTab]);

  // Build the value expected by `mui-tel-input` (full phone number with country code)
  const phoneInputValue =
    formik.values.country_code && formik.values.person_mobile
      ? `+${formik.values.country_code}${formik.values.person_mobile}`
      : formik.values.country_code
        ? `+${formik.values.country_code}`
        : formik.values.person_mobile || '';
  
  return (
    <>

<div className="mt-1">
<Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
        <TabsList className="flex flex-wrap">
          <Tab value="Information">Information</Tab>
          {provider?.providers?.length > 0 && <Tab value="Business">Business</Tab>}
          {/* <Tab value="Payments">Payments</Tab> */}
        </TabsList>
        <TabPanel value="Information">
          <div className="grid grid-cols-1 mt-5 xl:grid-cols-1 gap-5 lg:gap-7.5">
                  {/* Statistics Section */}

            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
              <form onSubmit={formik.handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label mb-1"> Name</label>
                  <input
                    className="input"
                    {...formik.getFieldProps('person_name')}
                  />
                </div>
                <div>
                  <label className="form-label mb-1"> Email</label>
                  <input className="input"   {...formik.getFieldProps('person_email')}
  />
                </div>
                <div>
                  <label className="form-label mb-1"> Phone Number</label>
                  <MuiPhoneInput
                    value={phoneInputValue}
                    onChange={(value, info) => {
                      // Extract mobile number without country code (digits only)
                      const cleaned = value.replace(/[^0-9]/g, ''); // Remove all non-digits
                      const cc = info?.countryCallingCode || formik.values.country_code || '20'; // fallback to Egypt
                      const mobile = cleaned.startsWith(cc) ? cleaned.slice(cc.length) : cleaned;
                      
                      formik.setFieldValue('person_mobile', mobile); // e.g. 10000444
                      formik.setFieldValue('country_code', cc); // e.g. 20 (without +)
                      formik.setFieldTouched('person_mobile', true);
                    }}
                    onBlur={() => {
                      formik.setFieldTouched('person_mobile', true);
                    }}
                    defaultCountry="EG"
                    className="input"
                  />
                </div>
                <div className="flex flex-col gap-1 w-full">
                <div className="flex items-center justify-between">
                  <label className="form-label mb-1">Password</label>
                </div>
                <label className="input w-full relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="off"
                    {...formik.getFieldProps('person_password')}
                    className={clsx('form-control w-full', {
                      'is-invalid': formik.touched.person_password && formik.errors.person_password
                    })}
                  />
                  <button
                    type="button"
                    className="btn btn-icon absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={togglePassword}
                    tabIndex={-1}
                  >
                    <i className={clsx('ki-filled ki-eye text-gray-500', { hidden: showPassword })}></i>
                    <i className={clsx('ki-filled ki-eye-slash text-gray-500', { hidden: !showPassword })}></i>
                  </button>
                </label>

                {formik.touched.person_password && formik.errors.person_password && (
                  <span role="alert" className="text-danger text-xs mt-1">{formik.errors.person_password}</span>
                )}
              </div>

              </div>
              <div className="flex justify-end items-center">
              <button type="submit" disabled={formik.isSubmitting} className="btn btn-primary mt-4">
  {formik.isSubmitting ? 'Saving...' : 'Save Changes'}
</button>

              </div>

              </form>
            </div>

          </div>
        </TabPanel>
        {provider?.providers?.length > 0 && (

        <TabPanel value="Business">
          <div className="grid grid-cols-1 mt-5 xl:grid-cols-1 gap-5 lg:gap-7.5">
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Business</h3>
                <div className="card-toolbar">
                  <button className="btn btn-primary">Add New Business</button>
                </div>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-2 gap-4">
                  {provider.providers.map((business) => (
                    <div key={business.id} className="card">
                      <div className="card-header">
                        <img 
                          src={business.image || toAbsoluteUrl('/media/avatars/blank.png')}
                          className="w-10 h-10 rounded-full" 
                          alt=""
                          onError={(e) => {
                            e.target.src = toAbsoluteUrl('/media/avatars/blank.png');
                          }}
                        />
                        <div className="card-toolbar">
                          <span className={clsx("badge", {
                            "badge-success": business.status === "active",
                            "badge-danger": business.status === "inactive",
                            "badge-warning": business.status === "waiting confirmation",
                            "badge-outline": true,
                            "capitalize": true
                          })}>● {business.status}</span>
                        </div>
                      </div>
                      <div className="card-body flex flex-col gap-y-8">
                        <div className="parent">
                          <Link to={`/businessprofile/${business.id}`} className="card-title hover:text-primary">
                            {business.name}
                          </Link>
                          <p className="card-title text-sm">{business.type?.name}</p>
                        </div>
                        <p className="card-title flex gap-x-8 text-sm">
                          <span>Offers: {business.statistics?.offers_count || 0}</span>
                          <span>Reservations: {business.statistics?.bookings_count || 0}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
        )}

    </Tabs>
    </div>

    </>
  );
};

const ProfileUserContent = forwardRef(ProfileUserContentComponent);

ProfileUserContentComponent.propTypes = {
  providerId: PropTypes.string.isRequired,
  provider: PropTypes.shape({
    id: PropTypes.number,
    name: PropTypes.string,
    email: PropTypes.string,
    mobile: PropTypes.string,
    country_code: PropTypes.number,
    image: PropTypes.string,
    person_status: PropTypes.string,
    providers: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string,
        image: PropTypes.string,
        status: PropTypes.string,
        type: PropTypes.shape({
          id: PropTypes.number,
          name: PropTypes.string
        }),
        statistics: PropTypes.shape({
          offers_count: PropTypes.number,
          bookings_count: PropTypes.number
        })
      })
    )
  }).isRequired,
  profileImage: PropTypes.string,
  setFormikMeta: PropTypes.func.isRequired
};

export { ProfileUserContent };
