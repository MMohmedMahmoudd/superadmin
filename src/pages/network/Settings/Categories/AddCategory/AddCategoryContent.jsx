import { useState } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { CrudAvatarUpload } from './CrudAvatarUpload';
import * as Yup from 'yup';

const AddCategoryContent = () => {
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const formik = useFormik({
    initialValues: {
    // Step 1
    sp_type_title_english: '',
    sp_type_title_arabic: '',
    sp_type_image: '',
    commission_percentage: '',
    sp_type_meta_desc_english: '',
    sp_type_meta_desc_arabic: '',
    sp_type_meta_keywords_english: '',
    sp_type_meta_keywords_arabic: '',
        },
    validationSchema: Yup.object({
        // Step 1


        }),
    onSubmit: async (values) => {
      try {
        setLoading(true);

        const data = new FormData();
        Object.entries(values).forEach(([key, val]) => {
          data.append(key, String(val));
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

        const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/categories`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('✅ category Created:', response.data);
        enqueueSnackbar('Main category created successfully!', { variant: 'success' });
        navigate('/categories');

        formik.resetForm();

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
    formik.setFieldValue('sp_type_image', file);
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
      {errors.sp_type_image && <p className="text-red-500 text-sm mt-1">{errors.sp_type_image}</p>}

      <p className="text-sm text-center text-gray-500 mt-1">Only *.png, *.jpg, and *.jpeg image files are accepted.</p>
      </div>

        <div className="form-group col-span-1">
          <label htmlFor="sp_type_title_english" className="form-label">Title English</label>
          <input
            type="text"
            id="sp_type_title_english"
            className={`input ${formik.touched.sp_type_title_english && formik.errors.sp_type_title_english ? 'is-invalid' : ''}`}
            {...formik.getFieldProps('sp_type_title_english')}
          />
          {formik.touched.sp_type_title_english && formik.errors.sp_type_title_english ? (
            <p role="alert" className="text-danger text-xs mt-1">{formik.errors.sp_type_title_english}</p>
          ) : null}
        </div>

        <div className="form-group col-span-1">
          <label htmlFor="sp_type_title_arabic" className="form-label">Title Arabic</label>
          <input
            type="text"
            id="sp_type_title_arabic"
            className={`input ${formik.touched.sp_type_title_arabic && formik.errors.sp_type_title_arabic ? 'is-invalid' : ''}`}
            {...formik.getFieldProps('sp_type_title_arabic')}
          />
          {formik.touched.sp_type_title_arabic && formik.errors.sp_type_title_arabic ? (
            <p role="alert" className="text-danger text-xs mt-1">{formik.errors.sp_type_title_arabic}</p>
          ) : null}
        </div>

        <div className="form-group col-span-1">
          <label htmlFor="sp_type_meta_desc_english" className="form-label">Meta Desc english</label>
          <input
            type="text"
            id="sp_type_meta_desc_english"
            className={`input ${formik.touched.sp_type_meta_desc_english && formik.errors.sp_type_meta_desc_english ? 'is-invalid' : ''}`}
            {...formik.getFieldProps('sp_type_meta_desc_english')}
          />
          {formik.touched.sp_type_meta_desc_english && formik.errors.sp_type_meta_desc_english ? (
            <p role="alert" className="text-danger text-xs mt-1">{formik.errors.sp_type_meta_desc_english}</p>
          ) : null}
        </div>
        <div className="form-group col-span-1">
          <label htmlFor="sp_type_meta_desc_arabic" className="form-label">Meta Desc Arabic</label>
          <input
            type="text"
            id="sp_type_meta_desc_arabic"
            className={`input ${formik.touched.sp_type_meta_desc_arabic && formik.errors.sp_type_meta_desc_arabic ? 'is-invalid' : ''}`}
            {...formik.getFieldProps('sp_type_meta_desc_arabic')}
          />
          {formik.touched.sp_type_meta_desc_arabic && formik.errors.sp_type_meta_desc_arabic ? (
            <p role="alert" className="text-danger text-xs mt-1">{formik.errors.sp_type_meta_desc_arabic}</p>
          ) : null}
        </div>
        <div className="form-group col-span-1">
          <label htmlFor="sp_type_meta_keywords_english" className="form-label">Meta Keywords English</label>
          <input
            type="text"
            id="sp_type_meta_keywords_english"
            className={`input ${formik.touched.sp_type_meta_keywords_english && formik.errors.sp_type_meta_keywords_english ? 'is-invalid' : ''}`}
            {...formik.getFieldProps('sp_type_meta_keywords_english')}
          />
          {formik.touched.sp_type_meta_keywords_english && formik.errors.sp_type_meta_keywords_english ? (
            <p role="alert" className="text-danger text-xs mt-1">{formik.errors.sp_type_meta_keywords_english}</p>
          ) : null}
        </div>
        <div className="form-group col-span-1">
          <label htmlFor="sp_type_meta_keywords_arabic" className="form-label">Meta Keywords Arabic</label>
          <input
            type="text"
            id="sp_type_meta_keywords_arabic"
            className={`input ${formik.touched.sp_type_meta_keywords_arabic && formik.errors.sp_type_meta_keywords_arabic ? 'is-invalid' : ''}`}
            {...formik.getFieldProps('sp_type_meta_keywords_arabic')}
          />
          {formik.touched.sp_type_meta_keywords_arabic && formik.errors.sp_type_meta_keywords_arabic ? (
            <p role="alert" className="text-danger text-xs mt-1">{formik.errors.sp_type_meta_keywords_arabic}</p>
          ) : null}
        </div>
        <div className="form-group col-span-2">
          <label htmlFor="commission_percentage" className="form-label">Commission Percentage</label>
          <input
            type="text"
            id="commission_percentage"
            className={`input ${formik.touched.commission_percentage && formik.errors.commission_percentage ? 'is-invalid' : ''}`}
            {...formik.getFieldProps('commission_percentage')}
          />
          {formik.touched.commission_percentage && formik.errors.commission_percentage ? (
            <p role="alert" className="text-danger text-xs mt-1">{formik.errors.commission_percentage}</p>
          ) : null}
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

export  {AddCategoryContent};