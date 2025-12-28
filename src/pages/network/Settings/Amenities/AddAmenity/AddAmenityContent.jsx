import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CrudAvatarUpload } from '../../Categories/AddCategory/CrudAvatarUpload';
import { useSnackbar } from 'notistack';

const AddAmenityContent = () => {
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    icon: '',
    sp_type_uid: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const storedAuth = localStorage.getItem(import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION);
      const authData = storedAuth ? JSON.parse(storedAuth) : null;
      const token = authData?.access_token;

      if (!token) {
        window.location.href = '/auth/login';
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/categories`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCategories(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (file) => {
    setFormData(prev => ({
      ...prev,
      icon: file
    }));
    if (errors.icon) {
      setErrors(prev => ({
        ...prev,
        icon: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name_en.trim()) {
      newErrors.name_en = 'Amenity name is required';
    }
    
    if (!formData.name_ar.trim()) {
      newErrors.name_ar = 'Arabic name is required';
    }
    
    if (!formData.icon) {
      newErrors.icon = 'Icon is required';
    }
    
    if (!formData.sp_type_uid) {
      newErrors.sp_type_uid = 'Category is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const storedAuth = localStorage.getItem(import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION);
      const authData = storedAuth ? JSON.parse(storedAuth) : null;
      const token = authData?.access_token;

      if (!token) {
        window.location.href = '/auth/login';
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('name_en', formData.name_en);
      formDataToSend.append('name_ar', formData.name_ar);
      formDataToSend.append('icon', formData.icon);
      formDataToSend.append('sp_type_uid', formData.sp_type_uid);

      const response = await axios.post(`${import.meta.env.VITE_APP_API_URL}/amenities`, formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      if (response.data.success === true || response.data.status === 200) {
        enqueueSnackbar('Amenity created successfully!', { variant: 'success' });
        navigate('/amenities');
      } else {
        enqueueSnackbar(response.data.message || 'Failed to create amenity', { variant: 'error' });
      }

      navigate('/amenities');
    } catch (error) {
      console.error('Error creating amenity:', error);
      if (error.response?.data?.errors) {
        const serverErrors = {};
        Object.keys(error.response.data.errors).forEach(key => {
          serverErrors[key] = error.response.data.errors[key][0];
        });
        setErrors(serverErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Add New Amenity</h3>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-2 flex flex-col items-center justify-center">
                <label className="form-label flex items-center justify-center">Icon *</label>
                <CrudAvatarUpload
                  onFileChange={handleImageChange}
                  className={errors.icon ? 'is-invalid' : ''}
                  accept="image/*"
                />
                {errors.icon && <div className="invalid-feedback">{errors.icon}</div>}
            </div>
            {/* Amenity Name */}
            <div>
              <label className="form-label">Amenity Name *</label>
              <input
                type="text"
                name="name_en"
                value={formData.name_en}
                onChange={handleInputChange}
                className={`input input-md input-bordered ${errors.name_en ? 'is-invalid' : ''}`}
                placeholder="Enter amenity name"
              />
              {errors.name_en && <div className="invalid-feedback">{errors.name_en}</div>}
            </div>

            {/* Arabic Name */}
            <div>
              <label className="form-label">Arabic Name *</label>
              <input
                type="text"
                name="name_ar"
                value={formData.name_ar}
                onChange={handleInputChange}
                className={`input input-md input-bordered ${errors.name_ar ? 'is-invalid' : ''}`}
                placeholder="Enter Arabic name"
                dir="rtl"
              />
              {errors.name_ar && <div className="invalid-feedback">{errors.name_ar}</div>}
            </div>

            {/* Category Selection */}
            <div>
              <label className="form-label">Category *</label>
              <select
                name="sp_type_uid"
                value={formData.sp_type_uid}
                onChange={handleInputChange}
                className={`select select-md select-bordered ${errors.sp_type_uid ? 'is-invalid' : ''}`}
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.sp_type_title}
                  </option>
                ))}
              </select>
              {errors.sp_type_uid && <div className="invalid-feedback">{errors.sp_type_uid}</div>}
            </div>

            {/* Icon Upload */}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/amenities')}
              className="btn btn-outline btn-secondary"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Creating...
                </>
              ) : (
                'Create Amenity'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { AddAmenityContent };
