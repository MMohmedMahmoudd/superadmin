import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios back
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types'; // Import PropTypes
import { CrudAvatarUpload } from '../../SupCategories/AddSupCategories/CrudAvatarUpload';
import * as Yup from 'yup';
import { MainCategorySelect } from './MainCategorySelect';

// Loading Spinner Component

function EditSupCategoryContent({ categoryData }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);

  const formik = useFormik({
    initialValues: {
      cat_name_english: '',
      cat_name_arabic: '',
      cat_description_english: '',
      cat_description_arabic: '',
      sp_type_uid: '',
      cat_meta_desc_english: '',
      cat_meta_desc_arabic: '',
      cat_meta_keywords_english: '',
      cat_meta_keywords_arabic: '',
      id: '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      cat_name_english: Yup.string()
        .required('English name is required')
        .min(2, 'English name must be at least 2 characters')
        .max(100, 'English name must not exceed 100 characters'),
      cat_name_arabic: Yup.string()
        .required('Arabic name is required')
        .min(2, 'Arabic name must be at least 2 characters')
        .max(100, 'Arabic name must not exceed 100 characters'),
      cat_description_english: Yup.string()
        .required('English description is required')
        .min(5, 'English description must be at least 5 characters')
        .max(500, 'English description must not exceed 500 characters'),
      cat_description_arabic: Yup.string()
        .required('Arabic description is required')
        .min(5, 'Arabic description must be at least 5 characters')
        .max(500, 'Arabic description must not exceed 500 characters'),
      sp_type_uid: Yup.string()
        .required('Service provider type is required'),
      cat_meta_desc_english: Yup.string()
        .required('English meta description is required')
        .max(160, 'English meta description must not exceed 160 characters'),
      cat_meta_desc_arabic: Yup.string()
        .required('Arabic meta description is required')
        .max(160, 'Arabic meta description must not exceed 160 characters'),
      cat_meta_keywords_english: Yup.string()
        .required('English meta keywords are required')
        .max(200, 'English meta keywords must not exceed 200 characters'),
      cat_meta_keywords_arabic: Yup.string()
        .required('Arabic meta keywords are required')
        .max(200, 'Arabic meta keywords must not exceed 200 characters'),
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);
        const storedAuth = localStorage.getItem(import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION);
        const authData = storedAuth ? JSON.parse(storedAuth) : null;
        const token = authData?.access_token;

        if (!token) {
          // Error handled in parent or show a notification
          enqueueSnackbar('Authentication token not found.', { variant: 'error' });
          navigate('/auth/login');
          return;
        }

        // Update endpoint for categories
        const formData = new FormData();
        for (const key in values) {
          if (values[key] !== null && values[key] !== undefined) {
            formData.append(key, values[key]);
          }
        }
        formData.append('_method', 'PUT'); // Use _method=PUT for update
        const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/subcategories/${categoryData.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        if (response.data.success) {
          enqueueSnackbar(`Sub Category ${values.cat_name_english} updated successfully!`, { variant: 'success' });
          navigate('/subcategory'); // Navigate to the categories list page
        } else {
          // Handle API error - could pass a prop up or show notification
          enqueueSnackbar(response.data.message || 'Failed to update category', { variant: 'error' });
        }
      } catch (error) {
        console.error('Error updating category:', error);
        // Handle submission error
        enqueueSnackbar(error.response?.data?.message || 'Error updating category', { variant: 'error' });
      } finally {
        setLoading(false);
      }
    },
  });

  useEffect(() => {
    if (categoryData) {
      formik.setValues({
        cat_name_english: categoryData.cat_name || '',
        cat_name_arabic: categoryData.cat_name_arabic || '',
        cat_description_english: categoryData.cat_description || '',
        cat_description_arabic: categoryData.cat_description_arabic || '',
        sp_type_uid: categoryData.sp_type_uid || '',
        cat_meta_desc_english: categoryData.cat_meta_desc || '',
        cat_meta_desc_arabic: categoryData.cat_meta_desc_arabic || '',
        cat_meta_keywords_english: categoryData.cat_meta_keywords || '',
        cat_meta_keywords_arabic: categoryData.cat_meta_keywords_arabic || '',
        id: categoryData.id || '',
      });
    }
  }, [categoryData]);

  const handleFileChange = (file) => {
    console.log("Selected file:", file);
    formik.setFieldValue('cat_image', file);
  };


  return (
    <div className="card col-span-4">
      <div className="card-header">
        <h3 className='card-title'>Edit Sub Category: {categoryData?.cat_name}</h3>
      </div>
      <div className="card-body">
        <form className="w-full grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={formik.handleSubmit}>
          <div className="flex col-span-2 justify-center items-center dark:bg-gray-200 bg-gray-100 rounded-lg py-4 flex-col gap-y-4 mb-4">
            <label className="block text-sm font-medium mb-1">Category Logo</label>
            <CrudAvatarUpload onFileChange={handleFileChange} avatarURL={categoryData?.cat_image} />
            {formik.touched.cat_image && formik.errors.cat_image && (
              <p className="text-red-500 text-sm mt-1">{formik.errors.cat_image}</p>
            )}
            <p className="text-sm text-center text-gray-500 mt-1">Only *.png, *.jpg, and *.jpeg image files are accepted.</p>
          </div>

          <div className="form-group col-span-1">
            <label htmlFor="cat_name_english" className="form-label">Name (English)</label>
            <input
              type="text"
              id="cat_name_english"
              className={`input ${formik.touched.cat_name_english && formik.errors.cat_name_english ? 'is-invalid' : ''}`}
              {...formik.getFieldProps('cat_name_english')}
            />
            {formik.touched.cat_name_english && formik.errors.cat_name_english && (
              <p role="alert" className="text-danger text-xs mt-1">{formik.errors.cat_name_english}</p>
            )}
          </div>

          <div className="form-group col-span-1">
            <label htmlFor="cat_name_arabic" className="form-label">Name (Arabic)</label>
            <input
              type="text"
              id="cat_name_arabic"
              className={`input ${formik.touched.cat_name_arabic && formik.errors.cat_name_arabic ? 'is-invalid' : ''}`}
              {...formik.getFieldProps('cat_name_arabic')}
            />
            {formik.touched.cat_name_arabic && formik.errors.cat_name_arabic && (
              <p role="alert" className="text-danger text-xs mt-1">{formik.errors.cat_name_arabic}</p>
            )}
          </div>

          <div className="form-group col-span-1">
            <label htmlFor="cat_description_english" className="form-label">Description (English)</label>
            <textarea
              id="cat_description_english"
              className={`textarea ${formik.touched.cat_description_english && formik.errors.cat_description_english ? 'is-invalid' : ''}`}
              {...formik.getFieldProps('cat_description_english')}
            />
            {formik.touched.cat_description_english && formik.errors.cat_description_english && (
              <p role="alert" className="text-danger text-xs mt-1">{formik.errors.cat_description_english}</p>
            )}
          </div>

          <div className="form-group col-span-1">
            <label htmlFor="cat_description_arabic" className="form-label">Description (Arabic)</label>
            <textarea
              id="cat_description_arabic"
              className={`textarea ${formik.touched.cat_description_arabic && formik.errors.cat_description_arabic ? 'is-invalid' : ''}`}
              {...formik.getFieldProps('cat_description_arabic')}
            />
            {formik.touched.cat_description_arabic && formik.errors.cat_description_arabic && (
              <p role="alert" className="text-danger text-xs mt-1">{formik.errors.cat_description_arabic}</p>
            )}
          </div>

          <div className="form-group col-span-1">
            <label htmlFor="cat_meta_desc_english" className="form-label">Meta Description (English)</label>
            <textarea
              id="cat_meta_desc_english"
              className={`textarea ${formik.touched.cat_meta_desc_english && formik.errors.cat_meta_desc_english ? 'is-invalid' : ''}`}
              {...formik.getFieldProps('cat_meta_desc_english')}
            />
            {formik.touched.cat_meta_desc_english && formik.errors.cat_meta_desc_english && (
              <p role="alert" className="text-danger text-xs mt-1">{formik.errors.cat_meta_desc_english}</p>
            )}
          </div>

          <div className="form-group col-span-1">
            <label htmlFor="cat_meta_desc_arabic" className="form-label">Meta Description (Arabic)</label>
            <textarea
              id="cat_meta_desc_arabic"
              className={`textarea ${formik.touched.cat_meta_desc_arabic && formik.errors.cat_meta_desc_arabic ? 'is-invalid' : ''}`}
              {...formik.getFieldProps('cat_meta_desc_arabic')}
            />
            {formik.touched.cat_meta_desc_arabic && formik.errors.cat_meta_desc_arabic && (
              <p role="alert" className="text-danger text-xs mt-1">{formik.errors.cat_meta_desc_arabic}</p>
            )}
          </div>

          <div className="form-group col-span-1">
            <label htmlFor="cat_meta_keywords_english" className="form-label">Meta Keywords (English)</label>
            <input
              type="text"
              id="cat_meta_keywords_english"
              className={`input ${formik.touched.cat_meta_keywords_english && formik.errors.cat_meta_keywords_english ? 'is-invalid' : ''}`}
              {...formik.getFieldProps('cat_meta_keywords_english')}
            />
            {formik.touched.cat_meta_keywords_english && formik.errors.cat_meta_keywords_english && (
              <p role="alert" className="text-danger text-xs mt-1">{formik.errors.cat_meta_keywords_english}</p>
            )}
          </div>

          <div className="form-group col-span-1">
            <label htmlFor="cat_meta_keywords_arabic" className="form-label">Meta Keywords (Arabic)</label>
            <input
              type="text"
              id="cat_meta_keywords_arabic"
              className={`input ${formik.touched.cat_meta_keywords_arabic && formik.errors.cat_meta_keywords_arabic ? 'is-invalid' : ''}`}
              {...formik.getFieldProps('cat_meta_keywords_arabic')}
            />
            {formik.touched.cat_meta_keywords_arabic && formik.errors.cat_meta_keywords_arabic && (
              <p role="alert" className="text-danger text-xs mt-1">{formik.errors.cat_meta_keywords_arabic}</p>
            )}
          </div>

          <div className="form-group col-span-2">
            <label htmlFor="sp_type_uid" className="form-label">Service Provider Type</label>
            <MainCategorySelect formik={formik} />
            {formik.touched.sp_type_uid && formik.errors.sp_type_uid && (
              <p role="alert" className="text-danger text-xs mt-1">{formik.errors.sp_type_uid}</p>
            )}
          </div>

          <div className="form-group col-span-1 md:col-span-2 flex justify-end">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Updating...' : 'Update Category'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

EditSupCategoryContent.propTypes = {
  categoryData: PropTypes.object,
};

export { EditSupCategoryContent };