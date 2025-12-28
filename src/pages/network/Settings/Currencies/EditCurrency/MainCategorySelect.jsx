import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const MainCategorySelect = ({ formik }) => {
  const [mainCategories, setMainCategories] = useState([]);
  const [mainCategoriesLoading, setMainCategoriesLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate(); // Using navigate here for auth redirect, though parent could handle.

  console.log('MainCategorySelect: formik.values.sp_type_uid =', formik.values.sp_type_uid);

  useEffect(() => {
    const fetchMainCategories = async () => {
      try {
        setMainCategoriesLoading(true);
        const storedAuth = localStorage.getItem(
          import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION
        );
        const authData = storedAuth ? JSON.parse(storedAuth) : null;
        const token = authData?.access_token;

        if (!token) {
          enqueueSnackbar('Authentication token not found. Please log in.', { variant: 'error' });
          navigate('/auth/login');
          return;
        }

        // Fetch English categories
        const responseEn = await axios.get(`${import.meta.env.VITE_APP_API_URL}/categories`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept-Language': 'en'
          }
        });

        // Fetch Arabic categories
         const responseAr = await axios.get(`${import.meta.env.VITE_APP_API_URL}/categories`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept-Language': 'ar'
          }
        });

        if (responseEn.data.success && responseAr.data.success) {
          const englishCategories = responseEn.data.data || [];
          const arabicCategories = responseAr.data.data || [];

          // Merge categories based on a unique identifier (assuming 'id' is unique)
          const mergedCategoriesMap = new Map();

          englishCategories.forEach(cat => mergedCategoriesMap.set(cat.id, { ...cat, sp_type_title_english: cat.sp_type_title }));
          arabicCategories.forEach(cat => {
            if (mergedCategoriesMap.has(cat.id)) {
              mergedCategoriesMap.set(cat.id, { ...mergedCategoriesMap.get(cat.id), sp_type_title_arabic: cat.sp_type_title });
            } else {
               // If for some reason an Arabic category exists without an English counterpart
              mergedCategoriesMap.set(cat.id, { ...cat, sp_type_title_arabic: cat.sp_type_title });
            }
          });

          setMainCategories(Array.from(mergedCategoriesMap.values()));
          console.log('MainCategorySelect: fetched and merged main categories:', Array.from(mergedCategoriesMap.values()));

        } else {
          enqueueSnackbar((responseEn.data.message || responseAr.data.message) || 'Failed to fetch main categories', { variant: 'error' });
        }

      } catch (error) {
        console.error('Error fetching main categories:', error);
        enqueueSnackbar(error.response?.data?.message || 'Error fetching main categories', { variant: 'error' });
      } finally {
        setMainCategoriesLoading(false);
      }
    };

    fetchMainCategories();
  }, [enqueueSnackbar, navigate]); // Depend on enqueueSnackbar and navigate

  return (
    <select
      id="sp_type_uid"
      className={`input ${formik.touched.sp_type_uid && formik.errors.sp_type_uid ? 'is-invalid' : ''}`}
      {...formik.getFieldProps('sp_type_uid')}
      disabled={mainCategoriesLoading}
    >
      <option value="">Select a main category</option>
      {mainCategoriesLoading ? (
        <option value="" disabled>Loading categories...</option>
      ) : (
        Array.isArray(mainCategories) && mainCategories.map(category => {
          console.log('MainCategorySelect: mapping category with id', category.id, 'and sp_type_uid', category.sp_type_uid);
          return (
            <option key={category.id} value={category.id}>
              {category.sp_type_title_english} ({category.sp_type_title_arabic})
            </option>
          );
        })
      )}
    </select>
  );
};

MainCategorySelect.propTypes = {
  formik: PropTypes.object.isRequired,
};

export { MainCategorySelect }; 