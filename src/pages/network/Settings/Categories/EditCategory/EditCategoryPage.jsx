import { Fragment, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container } from '@/components/container';
import { Toolbar,  ToolbarHeading, ToolbarPageTitle } from '@/partials/toolbar';
import { useLayout } from '@/providers';
// import { SettingsSidebarMenu } from '../SettingsSidebarMenu';
import { EditCategoryContent } from './EditCategoryContent';

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

const EditCategoryPage = () => {
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

        // Fetch English data
        const responseEn = await axios.get(`${import.meta.env.VITE_APP_API_URL}/categories?filter[sp_type_uid]=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept-Language': 'en'
          }
        });

        // Fetch Arabic data
        const responseAr = await axios.get(`${import.meta.env.VITE_APP_API_URL}/categories?filter[sp_type_uid]=${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept-Language': 'ar'
          }
        });

        console.log('API Response English:', responseEn);
        console.log('API Response Arabic:', responseAr);

        if (responseEn.data.success && responseAr.data.success) {
          const englishData = responseEn.data.data && responseEn.data.data.length > 0 ? responseEn.data.data[0] : {};
          const arabicData = responseAr.data.data && responseAr.data.data.length > 0 ? responseAr.data.data[0] : {};

          // Merge the data
          const mergedData = {
            ...englishData,
            sp_type_title_arabic: arabicData.sp_type_title || '',
            sp_type_meta_desc_arabic: arabicData.sp_type_meta_desc || '',
            sp_type_meta_keywords_arabic: arabicData.sp_type_meta_keywords || '',
          };


          console.log('Merged data:', mergedData);

          if (mergedData.id) {
            setCategoryData(mergedData);
          } else {
            setError('Category data not found in either language.');
          }
        } else {
          setError((responseEn.data.message || responseAr.data.message) || 'Failed to fetch category data');
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
    <EditCategoryContent categoryData={categoryData} />
  ) : (
    <div>No category data found.</div>
  )}
</Container>
  </Fragment>;
};

export { EditCategoryPage };