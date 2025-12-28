import { useState, useEffect } from 'react';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { CitySelect } from '../AddZone/CitySelect';
import { CountrySelect } from '../AddZone/CountrySelect';
import { useParams } from 'react-router-dom';

const EditZoneContent = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [, setErrors] = useState({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [pendingCityId, setPendingCityId] = useState(null);

  const formik = useFormik({
    initialValues: {
      zone_name_en: '',
      zone_name_ar: '',
      city_uid: '',
      country_uid: ''
    },
    validationSchema: Yup.object({
      zone_name_en: Yup.string().required('Zone name in English is required'),
      zone_name_ar: Yup.string().required('Zone name in Arabic is required'),
      city_uid: Yup.string().required('City is required'),
    }),
    onSubmit: (values) => {
      console.log('Form submitted:', values);
    },
  });

  useEffect(() => {
    const fetchZoneData = async () => {
      try {
        setInitialLoading(true);
        const token = JSON.parse(localStorage.getItem(
          import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION
        ))?.access_token;

        // Fetch zone data
        const response = await axios.get(
          `${import.meta.env.VITE_APP_API_URL}/zones/list?filter[zone_uid]=${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success && response.data.data.length > 0) {
          const zoneData = response.data.data[0];
          
          // Extract zone names from the new structure
          const zoneNameEn = zoneData?.name?.en || '';
          const zoneNameAr = zoneData?.name?.ar || '';
          
          // Extract country and city ids directly from the response
          const countryId = zoneData?.country?.id ? zoneData.country.id.toString() : '';
          const cityId = zoneData?.city?.id ? zoneData.city.id.toString() : '';

          // Set zone names immediately
          formik.setFieldValue('zone_name_en', zoneNameEn);
          formik.setFieldValue('zone_name_ar', zoneNameAr);
          
          // Set country first
          if (countryId) {
            formik.setFieldValue('country_uid', countryId);
            
            // Store city ID to set after cities are loaded for the country
            if (cityId) {
              setPendingCityId(cityId);
            }
          } else {
            enqueueSnackbar('Could not find country information.', { variant: 'warning' });
          }
          
        } else {
            enqueueSnackbar('Zone not found or data is empty.', { variant: 'warning' });
        }
      } catch (error) {
        console.error('Error fetching zone data:', error);
        console.error('Error response:', error.response?.data);
        enqueueSnackbar('Failed to load zone data', { variant: 'error' });
      } finally {
        setInitialLoading(false);
      }
    };

    if (id) {
      fetchZoneData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Effect to set city_uid after cities are loaded for the selected country
  useEffect(() => {
    const setCityAfterLoad = async () => {
      if (pendingCityId && formik.values.country_uid) {
        try {
          // Fetch cities for the country to ensure they're loaded
          const token = JSON.parse(localStorage.getItem(
            import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION
          ))?.access_token;

          const response = await axios.get(
            `${import.meta.env.VITE_APP_API_URL}/cities/list?filter[country_uid]=${formik.values.country_uid}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          const cities = response.data?.data || [];
          // Check if the pending city exists in the fetched cities
          const cityExists = cities.some(city => city.id.toString() === pendingCityId);
          
          if (cityExists) {
            // Now set the city_uid since cities are loaded
            formik.setFieldValue('city_uid', pendingCityId);
            setPendingCityId(null);
          }
        } catch (error) {
          console.error('Error fetching cities for city selection:', error);
          // Fallback: try setting it anyway after a delay
          setTimeout(() => {
            if (pendingCityId) {
              formik.setFieldValue('city_uid', pendingCityId);
              setPendingCityId(null);
            }
          }, 1000);
        }
      }
    };

    setCityAfterLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.country_uid, pendingCityId]);

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
      data.append('_method', 'PUT');

      const token = JSON.parse(localStorage.getItem(
        import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION
      ))?.access_token;

      const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/zone/${id}/update`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('✅ Zone Updated:', response.data);
      enqueueSnackbar('Zone updated successfully!', { variant: 'success' });
      navigate('/Zones');

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
              <div className="col-span-3 xl:col-span-2 card p-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1 ">
                    <CountrySelect formik={formik} />
                  </div>
                  <div className="col-span-1 ">
                    <CitySelect formik={formik} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="form-label mb-1">Zone Name (English)</label>
                    <input
                      type="text"
                      className="input bg-transparent"
                      {...formik.getFieldProps('zone_name_en')}
                    />
                    {formik.touched.zone_name_en && formik.errors.zone_name_en && (
                      <p className="text-red-500 text-xs mt-1">{formik.errors.zone_name_en}</p>
                    )}
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="form-label mb-1">Zone Name (Arabic)</label>
                    <input
                      type="text"
                      className="input bg-transparent"
                      {...formik.getFieldProps('zone_name_ar') }
                      dir="rtl"
                    />
                    {formik.touched.zone_name_ar && formik.errors.zone_name_ar && (
                      <p className="text-red-500 text-xs mt-1">{formik.errors.zone_name_ar}</p>
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

export  {EditZoneContent};

