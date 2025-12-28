import { Fragment, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container } from '@/components/container';
import { Toolbar,  ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { useLayout } from '@/providers';
import { EditCurrencyContent } from './EditCurrencyContent';

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

const EditCurrencyPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [currencyData, setCurrencyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCurrency = async () => {
      try {
        setLoading(true);
        console.log('Fetching currency with ID:', id);
        const storedAuth = localStorage.getItem(import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION);
        const authData = storedAuth ? JSON.parse(storedAuth) : null;
        const token = authData?.access_token;

        if (!token) {
          setError('Authentication token not found.');
          setLoading(false);
          navigate('/auth/login'); // Redirect to login if no token
          return;
        }

        // Fetch currency data with default language
        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/currencies/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        console.log('API Response:', response);

        if (response.data.success) {
          const currencyData = response.data.data;
          console.log('Currency data:', currencyData);

          if (currencyData) {
            setCurrencyData(currencyData);
          } else {
            setError('Currency data not found.');
          }
        } else {
          setError(response.data.message || 'Failed to fetch currency data');
        }
      } catch (error) {
        console.error('Error fetching currency:', error);
        setError(error.response?.data?.message || 'Error fetching currency');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCurrency();
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
  ) : currencyData ? (
    <EditCurrencyContent currencyData={currencyData} />
  ) : (
    <div>No currency data found.</div>
  )}
</Container>
  </Fragment>;
};

export { EditCurrencyPage };