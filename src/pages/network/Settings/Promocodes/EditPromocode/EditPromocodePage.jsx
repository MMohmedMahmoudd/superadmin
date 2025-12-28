import { Fragment, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container } from '@/components/container';
import { Toolbar,  ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { useLayout } from '@/providers';
import { EditPromocodeContent } from './EditPromocodeContent';

const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-[250px]">
    <div
      className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent text-primary"
      role="status"
    >
      <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
        Loading...
      </span>
    </div>
  </div>
);

// Add mapping function for promocode data
function mapPromocodeData(apiData) {
  return {
    id: apiData.id,
    service_type: apiData.service_type === 'Booking' ? '2' : '1',
    code: apiData.code,
    type: apiData.type,
    percentage: apiData.percentage,
    one_time: apiData.one_time?.toString() ?? '',
    using_limit: apiData.using_limit,
    using_count: apiData.using_count,
    status: apiData.status === 'Active' ? '1' : '2',
    user_id: apiData.user?.id?.toString() ?? '',
    // Optionally, you can add user_name: apiData.user?.name
  };
}

const EditPromocodePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [categoryData, setCategoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        setLoading(true);
        console.log('Fetching category with ID:', id);
        const storedAuth = localStorage.getItem(import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION);
        const authData = storedAuth ? JSON.parse(storedAuth) : null;
        const token = authData?.access_token;

        if (!token) {
          setError('Authentication token not found.');
          setLoading(false);
          navigate('/auth/login'); // Redirect to login if no token
          return;
        }

        // Fetch promocode using the list endpoint with filter
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/promocodes?filter[id]=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept-Language': 'en'
          }
        });

        if (response.data.success) {
          const promocode = Array.isArray(response.data.data) && response.data.data.length > 0
            ? response.data.data[0]
            : {};
          const mappedData = mapPromocodeData(promocode);
          console.log('Mapped data:', mappedData);
          if (mappedData.id) {
            setCategoryData(mappedData);
          } else {
            setError('Promocode data not found.');
          }
        } else {
          setError(response.data.message || 'Failed to fetch promocode data');
        }
      } catch (error) {
        console.error('Error fetching category:', error);
        setError(error.response?.data?.message || 'Error fetching category');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCategory();
    }
  }, [id, navigate]);

  const { currentLayout } = useLayout();

  return <Fragment>
    {currentLayout?.name === 'demo1-layout' && <Container>
      <Toolbar>
        <ToolbarHeading>
          <ToolbarPageTitle />
        </ToolbarHeading>
      </Toolbar>
    </Container>}

    <Container>
  {loading ? (
    <LoadingSpinner />
  ) : error ? (
    <div className="text-red-500">Error: {error}</div>
  ) : categoryData ? (
    <EditPromocodeContent categoryData={categoryData} />
  ) : (
    <div>No promocode data found.</div>
  )}
</Container>
  </Fragment>;
};

export { EditPromocodePage };