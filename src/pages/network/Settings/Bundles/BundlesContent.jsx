import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// import { useEffect, useMemo, useState } from 'react';

const BundlesContent = () => {
  const [bundles, setBundles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBundles = async () => {
      try {
        setLoading(true);
        const storedAuth = localStorage.getItem(import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION);
        const authData = storedAuth ? JSON.parse(storedAuth) : null;
        const token = authData?.access_token;

        if (!token) {
          navigate('/auth/login');
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/bundles`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data.success) {
          setBundles(response.data.data);
        } else {
          setError('Failed to fetch bundles');
        }
      } catch (error) {
        setError(error.response?.data?.message || 'Error fetching bundles');
      } finally {
        setLoading(false);
      }
    };

    fetchBundles();
  }, [navigate]);

  if (loading) {
    return (
<div className="flex justify-center items-center col-span-4">
  <div
    className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-primary"
    role="status"
  >
    <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
      Loading...
    </span>
  </div>
</div>);
  }

  if (error) {
    return (
      <div className="col-span-4 card">
        <div className="flex p-4 flex-col gap-4">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="col-span-4 ">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {bundles.map((bundle) => (
            <div key={bundle.bundle_uid} className="card rounded-lg shadow p-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">{bundle.bundle_name}</h3>
              <div className="space-y-2">
                <p className="text-gray-600">
                  <span className="font-medium">Commission:</span> {bundle.bundle_comission}%
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Usage Time:</span> {bundle.bundle_usage_time} days
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Duration:</span> {bundle.bundle_duration} days
                </p>
                <p className="text-gray-600">
                  <span className="font-medium">Added Date:</span> {new Date(bundle.bundle_add_date).toLocaleDateString()}
                </p>
              </div>
              <div className='mt-4'>
                <button className='btn btn-outline btn-primary w-full flex justify-center items-center' onClick={() => navigate(`/editbundle/${bundle.bundle_uid}`)}>Edit</button>
              </div>
            </div>
          ))}
        </div>
    </div>
  );  
};

export { BundlesContent };
