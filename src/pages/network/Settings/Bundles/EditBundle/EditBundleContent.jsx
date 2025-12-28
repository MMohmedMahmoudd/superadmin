import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';

// import * as Yup from 'yup'; // Import Yup for validation if needed

function EditBundleContent() {
  const { id } = useParams();
  console.log('id from useParams:', id);
  const [bundleData, setBundleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      bundle_name: '',
      bundle_comission: 0,
      bundle_usage_time: 0,
      bundle_duration: 0,
    },
    // validationSchema: Yup.object({...}), // Add validation schema here if needed
    onSubmit: async (values) => {
      try {
        const storedAuth = localStorage.getItem(import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION);
        const authData = storedAuth ? JSON.parse(storedAuth) : null;
        const token = authData?.access_token;

        if (!token) {
          setError('Authentication token not found.');
          navigate('/auth/login');
          return;
        }

        // Assuming the update endpoint is POST /bundles/:id with method _method=PUT
        const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/bundles/${id}`, {
          ...values,
          _method: 'PUT' // Use _method=PUT for update
        }, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json' // Or multipart/form-data if sending files
          }
        });

        if (response.data.success) {
            enqueueSnackbar(`Bundle ${values.bundle_name} updated successfully!`, { variant: 'success' });
            navigate('/bundles'); // Redirect to login if no token

          // Optionally navigate back to the bundles list or show a success message
        } else {
          setError(response.data.message || 'Failed to update bundle');
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Error updating bundle');
      }
    },
  });

  useEffect(() => {
    const fetchBundle = async () => {
      try {
        setLoading(true);
        console.log('Fetching bundle with ID:', id);
        const storedAuth = localStorage.getItem(import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION);
        const authData = storedAuth ? JSON.parse(storedAuth) : null;
        const token = authData?.access_token;

        if (!token) {
          // Handle no token case, perhaps redirect to login
          setError('Authentication token not found.');
          setLoading(false);
          navigate('/auth/login'); // Redirect to login if no token
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/bundles?filter[bundle_uid]=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        console.log('API Response:', response);

        if (response.data.success) {
          if (response.data.data && response.data.data.length > 0) {
            setBundleData(response.data.data[0]);
            
          } else {
            setError('Bundle not found.');
          }
        } else {
          setError(response.data.message || 'Failed -to fetch bundle');
        }
      } catch (error) {
        console.error('Error fetching bundle:', error);
        setError(error.response?.data?.message || 'Error fetching bundle');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchBundle();
    }
  }, [id, navigate]);

  useEffect(() => {
    if (bundleData) {
      formik.setValues(bundleData);
    }
  }, [bundleData]);

  if (loading) {
    return   <div className="flex justify-center items-center min-h-[250px]">
    <div
      className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-primary"
      role="status"
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  </div>
;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!bundleData) {
    return <div>Bundle not found.</div>;
  }

  return (
    <div className='card'>
        <div className="card-header">
        <h2>Edit Bundle: {bundleData.bundle_name}</h2>
        </div>
      <div className='card-body '>
      <form onSubmit={formik.handleSubmit} className='grid grid-cols-2 gap-4'>
        <div>
          <label htmlFor="bundle_name">Bundle Name:</label>
          <input
          className='input'
            id="bundle_name"
            name="bundle_name"
            type="text"
            onChange={formik.handleChange}
            value={formik.values.bundle_name}
          />
          {/* {formik.errors.bundle_name && <div>{formik.errors.bundle_name}</div>} */}
        </div>
        <div >
          <label htmlFor="bundle_comission">Commission:</label>
          <input
          className='input'
            id="bundle_comission"
            name="bundle_comission"
            type="number"
            onChange={formik.handleChange}
            value={formik.values.bundle_comission}
          />
          {/* {formik.errors.bundle_comission && <div>{formik.errors.bundle_comission}</div>} */}
        </div>
        <div>
          <label htmlFor="bundle_usage_time">Usage Time (days):</label>
          <input
          className='input'
            id="bundle_usage_time"
            name="bundle_usage_time"
            type="number"
            onChange={formik.handleChange}
            value={formik.values.bundle_usage_time}
          />
          {/* {formik.errors.bundle_usage_time && <div>{formik.errors.bundle_usage_time}</div>} */}
        </div>
        <div>
          <label htmlFor="bundle_duration">Duration (days):</label>
          <input
          className='input'
            id="bundle_duration"
            name="bundle_duration"
            type="number"
            onChange={formik.handleChange}
            value={formik.values.bundle_duration}
          />
          {/* {formik.errors.bundle_duration && <div>{formik.errors.bundle_duration}</div>} */}
        </div>
        <div className="col-span-2 flex justify-end items-center">
        <button type="submit" className='btn btn-outline btn-primary'>Update Bundle</button>
        </div>
      </form>
      </div>
    </div>
  );
}

export { EditBundleContent };