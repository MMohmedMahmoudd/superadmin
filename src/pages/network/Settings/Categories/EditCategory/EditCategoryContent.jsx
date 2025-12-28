import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios back
import { useFormik } from 'formik';
import { useSnackbar } from 'notistack';
import PropTypes from 'prop-types'; // Import PropTypes
import { CrudAvatarUpload } from '../AddCategory';

// import * as Yup from 'yup'; // Import Yup for validation if needed

// Loading Spinner Component

function EditCategoryContent({ categoryData }) {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const formik = useFormik({
    initialValues: {
      sp_type_title_english: '',
      sp_type_title_arabic: '',
      commission_percentage: 0,
      sp_type_meta_desc_english: '',
      sp_type_meta_desc_arabic: '',
      sp_type_meta_keywords_english: '',
      sp_type_meta_keywords_arabic: '',
      id: '',
    },
    enableReinitialize: true,
    // validationSchema: Yup.object({...}), // Add validation schema here if needed
    onSubmit: async (values) => {
      try {
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

        const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/categories/${categoryData.id}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });

        if (response.data.success) {
          enqueueSnackbar(`Category ${values.sp_type_title_english} updated successfully!`, { variant: 'success' });
          navigate('/maincategories'); // Navigate to the categories list page
        } else {
          // Handle API error - could pass a prop up or show notification
          enqueueSnackbar(response.data.message || 'Failed to update category', { variant: 'error' });
        }
      } catch (submitError) { // Renamed error to submitError to avoid conflict with prop
        console.error('Error updating category:', submitError);
        // Handle submission error
        enqueueSnackbar(submitError.response?.data?.message || 'Error updating category', { variant: 'error' });
      }
    },
  });

  useEffect(() => {
    if (categoryData) {
      formik.setValues({
        sp_type_title_english: categoryData.sp_type_title || '',
        sp_type_title_arabic: categoryData.sp_type_title_arabic || '',
        commission_percentage: parseFloat(categoryData.commission_percentage) || 0,
        sp_type_meta_desc_english: categoryData.sp_type_meta_desc || '',
        sp_type_meta_desc_arabic: categoryData.sp_type_meta_desc_arabic || '',
        sp_type_meta_keywords_english: categoryData.sp_type_meta_keywords || '',
        sp_type_meta_keywords_arabic: categoryData.sp_type_meta_keywords_arabic || '',
        id: categoryData.id || '',
      });
    }
  }, [categoryData]);

  const handleFileChange = (file) => {
    console.log("Selected file:", file);
    formik.setFieldValue('sp_type_image', file);
  };


  return (
    <div className='card'>
      <div className="card-header">
        <h2>Edit Category : {categoryData?.sp_type_title}</h2>
      </div>
      <div className='card-body'>
        <form onSubmit={formik.handleSubmit} className='grid grid-cols-2 gap-4'>
        <div className=" flex col-span-2 justify-center items-center dark:bg-gray-200 bg-gray-100 rounded-lg py-4 flex-col gap-y-4 mb-4">
      <label className="block text-sm font-medium mb-1">Main Category Logo  </label> 
      <CrudAvatarUpload onFileChange={handleFileChange} avatarURL={categoryData?.sp_type_image} />
      {/* {errors.sp_image && <p className="text-red-500 text-sm mt-1">{errors.sp_image}</p>} */}

      <p className="text-sm text-center text-gray-500 mt-1">Only *.png, *.jpg, and *.jpeg image files are accepted.</p>
      </div>

          <div>
            <label htmlFor="sp_type_title_english">Category Name (English):</label>
            <input
              className='input'
              id="sp_type_title_english"
              name="sp_type_title_english"
              type="text"
              onChange={formik.handleChange}
              value={formik.values.sp_type_title_english}
            />
            {/* {formik.errors.sp_type_title_english && <div>{formik.errors.sp_type_title_english}</div>} */}
          </div>
          <div>
            <label htmlFor="sp_type_title_arabic">Category Name (Arabic):</label>
            <input
              className='input'
              id="sp_type_title_arabic"
              name="sp_type_title_arabic"
              type="text"
              onChange={formik.handleChange}
              value={formik.values.sp_type_title_arabic}
            />
            {/* {formik.errors.sp_type_title_arabic && <div>{formik.errors.sp_type_title_arabic}</div>} */}
          </div>

          <div>
            <label htmlFor="sp_type_meta_desc_english">Meta Description (English):</label>
            <input
              className='input'
              id="sp_type_meta_desc_english"
              name="sp_type_meta_desc_english"
              type="text"
              onChange={formik.handleChange}
              value={formik.values.sp_type_meta_desc_english}
            />
            {/* {formik.errors.sp_type_meta_desc_english && <div>{formik.errors.sp_type_meta_desc_english}</div>} */}
          </div>
          <div>
            <label htmlFor="sp_type_meta_desc_arabic">Meta Description (Arabic):</label>
            <input
              className='input'
              id="sp_type_meta_desc_arabic"
              name="sp_type_meta_desc_arabic"
              type="text"
              onChange={formik.handleChange}
              value={formik.values.sp_type_meta_desc_arabic}
            />
            {/* {formik.errors.sp_type_meta_desc_arabic && <div>{formik.errors.sp_type_meta_desc_arabic}</div>} */}
          </div>

          <div>
            <label htmlFor="sp_type_meta_keywords_english">Meta Keywords (English):</label>
            <input
              className='input'
              id="sp_type_meta_keywords_english"
              name="sp_type_meta_keywords_english"
              type="text"
              onChange={formik.handleChange}
              value={formik.values.sp_type_meta_keywords_english}
            />
            {/* {formik.errors.sp_type_meta_keywords_english && <div>{formik.errors.sp_type_meta_keywords_english}</div>} */}
          </div>
          <div>
            <label htmlFor="sp_type_meta_keywords_arabic">Meta Keywords (Arabic):</label>
            <input
              className='input'
              id="sp_type_meta_keywords_arabic"
              name="sp_type_meta_keywords_arabic"
              type="text"
              onChange={formik.handleChange}
              value={formik.values.sp_type_meta_keywords_arabic}
            />
            {/* {formik.errors.sp_type_meta_keywords_arabic && <div>{formik.errors.sp_type_meta_keywords_arabic}</div>} */}
          </div>
          <div className='col-span-2'>
            <label htmlFor="commission_percentage">Commission:</label>
            <input
              className='input'
              id="commission_percentage"
              name="commission_percentage"
              type="text"
              onChange={(e) => {
                // Allow only numbers and a single percentage sign at the end
                const value = e.target.value;
                const numericValue = parseFloat(value);
                if (!isNaN(numericValue) || value === '' || value === '%') {
                  formik.setFieldValue('commission_percentage', numericValue || '');
                } else if (value.endsWith('%') && !isNaN(parseFloat(value.slice(0, -1)))) {
                   formik.setFieldValue('commission_percentage', parseFloat(value.slice(0, -1)));
                } else if (value.length === 1 && !isNaN(parseFloat(value))){
                   formik.setFieldValue('commission_percentage', parseFloat(value));
                }
                // Note: The input value displayed will be handled by the value prop below
              }}
              value={formik.values.commission_percentage === 0 ? '' : `${formik.values.commission_percentage}%`}
            />
            {/* {formik.errors.commission_percentage && <div>{formik.errors.commission_percentage}</div>} */}
          </div>


          <div className="col-span-2 flex justify-end items-center">
            <button type="submit" className='btn btn-outline btn-primary'>Update Category</button>
          </div>
        </form>
      </div>
    </div>
  );
}

EditCategoryContent.propTypes = {
  categoryData: PropTypes.object,
};

export { EditCategoryContent};