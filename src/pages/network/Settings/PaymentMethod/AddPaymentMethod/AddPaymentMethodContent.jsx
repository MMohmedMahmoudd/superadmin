import { useState } from 'react';
import axios from 'axios';
import { useSnackbar } from 'notistack';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import { CrudAvatarUpload } from '../../Categories/AddCategory/CrudAvatarUpload';
import * as Yup from 'yup';

const AddPaymentMethodContent = () => {
  const [loading, setLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const navigate = useNavigate();
  const [errors, setErrors] = useState({});
  const formik = useFormik({
    initialValues: {
    // Step 1
    name_en: '',
    name_ar: '',
    image: '',
        },
    validationSchema: Yup.object({
        name_en: Yup.string().required('English Name is required'),
        name_ar: Yup.string().required('Arabic Name is required'),
        image: Yup.mixed().required('Image is required'),
        }),
    onSubmit: async (values) => {
      try {
        setLoading(true);

        const data = new FormData();
        Object.entries(values).forEach(([key, val]) => {
          if (val instanceof File) {
            data.append(key, val);
          } else {
            data.append(key, String(val));
          }
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

        const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/payment-methods`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('✅ Payment Method:', response.data);
        enqueueSnackbar('Payment Method created successfully!', { variant: 'success' });
        navigate('/paymentmethod');

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
    formik.setFieldValue('image', file);
  };

  return (
    <div className="card col-span-4 ">
    <div className="card-header">
      <h3 className='card-title'>Payment Method Information</h3>
    </div>
    <div className="card-body">
      <form className="w-full grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={formik.handleSubmit}>
      <div className=" flex col-span-2 justify-center items-center dark:bg-gray-200 bg-gray-100 rounded-lg py-4 flex-col gap-y-4 mb-4">
      <label className="block text-sm font-medium mb-1">Payment Method Logo  </label> 
      <CrudAvatarUpload onFileChange={handleFileChange} />
      {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}

      <p className="text-sm text-center text-gray-500 mt-1">Only *.png, *.jpg, and *.jpeg image files are accepted.</p>
      </div>

        <div className="form-group col-span-1">
          <label htmlFor="name_en" className="form-label">Name English</label>
          <input
            type="text"
            id="name_en"
            className={`input ${formik.touched.name_en && formik.errors.name_en ? 'is-invalid' : ''}`}
            {...formik.getFieldProps('name_en')}
          />
          {formik.touched.name_en && formik.errors.name_en ? (
            <p role="alert" className="text-danger text-xs mt-1">{formik.errors.name_en}</p>
          ) : null}
        </div>

        <div className="form-group col-span-1">
          <label htmlFor="name_ar" className="form-label">Name Arabic</label>
          <input
            type="text"
            id="name_ar"
            className={`input ${formik.touched.name_ar && formik.errors.name_ar ? 'is-invalid' : ''}`}
            {...formik.getFieldProps('name_ar')}
          />
          {formik.touched.name_ar && formik.errors.name_ar ? (
            <p role="alert" className="text-danger text-xs mt-1">{formik.errors.name_ar}</p>
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

export  {AddPaymentMethodContent};