import { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { customStyles } from '../../../Bussiness/AddBussiness/PersonNameSelect';

const MainCategorySelect = ({ formik }) => {
  const [mainCategories, setMainCategories] = useState([]);
  const [mainCategoriesLoading, setMainCategoriesLoading] = useState(true);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate(); // Using navigate here for auth redirect, though parent could handle.

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

  const options = mainCategories.map((category) => {
    const rawVal = category.sp_type_uid ?? category.id;
    const value = rawVal === undefined || rawVal === null || rawVal === '' ? '' : Number(rawVal);
    return {
      value,
      label: `${category.sp_type_title_english} (${category.sp_type_title_arabic})`,
    };
  });

  return (
    <Select
      inputId="sp_type_uid"
      name="sp_type_uid"
      classNamePrefix="react-select"
      isLoading={mainCategoriesLoading}
      isDisabled={mainCategoriesLoading}
      options={options}
      placeholder="Select a main category"
      value={
        options.find(
          (opt) =>
            opt.value === formik.values.sp_type_uid ||
            (opt.value !== '' && Number(formik.values.sp_type_uid) === opt.value)
        ) || null
      }
      onChange={(selected) => {
        const numericValue = selected?.value === '' ? '' : Number(selected?.value);
        formik.setFieldValue('sp_type_uid', numericValue);
      }}
      onBlur={() => formik.setFieldTouched('sp_type_uid', true)}
      styles={customStyles}
    />
  );
};

MainCategorySelect.propTypes = {
  formik: PropTypes.object.isRequired,
};

export { MainCategorySelect }; 