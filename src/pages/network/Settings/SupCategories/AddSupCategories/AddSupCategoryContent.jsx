import { useState } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { CrudAvatarUpload } from './CrudAvatarUpload';
import * as Yup from 'yup';
import { MainCategorySelect } from './MainCategorySelect';

const AddSupCategoryContent = () => {
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});

  const formik = useFormik({
    initialValues: {
    // Step 1
    cat_name_english: '',
    cat_name_arabic: '',
    cat_description_english: '',
    cat_description_arabic: '',
    sp_type_uid: '',
    cat_meta_desc_english: '',
    cat_meta_desc_arabic: '',
    cat_meta_keywords_english: '',
    cat_meta_keywords_arabic: '',
    cat_image: '',
        },
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
        sp_type_uid: Yup.number()
            .typeError('Service provider type must be selected')
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
        cat_image: Yup.mixed()
            .required('Category image is required')
    }),
    onSubmit: async (values) => {
      try {
        setLoading(true);

        const data = new FormData();
        Object.entries(values).forEach(([key, val]) => {
          if (key === 'cat_image' && val) {
            data.append(key, val);
          } else if (key === 'sp_type_uid') {
            const numericVal = val === '' ? '' : Number(val);
            data.append(key, numericVal);
          } else {
            data.append(key, val);
          }
        });
        console.log('FormData payload:', {
          ...values,
          sp_type_uid: values.sp_type_uid === '' ? '' : Number(values.sp_type_uid),
          cat_image: values.cat_image ? values.cat_image.name : null,
        });
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

        const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/subcategories`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('✅ category Created:', response.data);
        enqueueSnackbar('Main category created successfully!', { variant: 'success' });
        formik.resetForm();
        navigate('/subcategory');

      } catch (error) {
        console.error('❌ Submission failed:', error);
        const responseErrors = error?.response?.data?.errors || {};
        setErrors(responseErrors);

        const errorMessage =
          error?.response?.data?.message ||
          Object.values(responseErrors)[0]?.[0] ||
          'Something went wrong. Please try again.';

        enqueueSnackbar(errorMessage, { variant: 'error' });

      } finally {
        setLoading(false);
      }
    },
  });

  const handleFileChange = (file) => {
    console.log("Selected file:", file);
    formik.setFieldValue('cat_image', file);
  };

  return (
    <div className="card col-span-4 ">
    <div className="card-header">
      <h3 className='card-title'>Category Information</h3>
    </div>
    <div className="card-body">
      <form className="w-full grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={formik.handleSubmit}>
      <div className=" flex col-span-2 justify-center items-center dark:bg-gray-200 bg-gray-100 rounded-lg py-4 flex-col gap-y-4 mb-4">
      <label className="block text-sm font-medium mb-1">Main Category Logo  </label> 
      <CrudAvatarUpload onFileChange={handleFileChange} />
      {errors.sp_image && <p className="text-red-500 text-sm mt-1">{errors.sp_image}</p>}

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
            className={`input ${formik.touched.cat_description_english && formik.errors.cat_description_english ? 'is-invalid' : ''}`}
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
            className={`input ${formik.touched.cat_description_arabic && formik.errors.cat_description_arabic ? 'is-invalid' : ''}`}
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
            className={`input ${formik.touched.cat_meta_desc_english && formik.errors.cat_meta_desc_english ? 'is-invalid' : ''}`}
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
            className={`input ${formik.touched.cat_meta_desc_arabic && formik.errors.cat_meta_desc_arabic ? 'is-invalid' : ''}`}
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
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
    </div>

  );
};

export  {AddSupCategoryContent};