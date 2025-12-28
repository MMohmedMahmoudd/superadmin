import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

const MainCategorySelect = ({ selectedCategory, onCategoryChange }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMainCategories = async () => {
    try {
      setLoading(true);
      const storedAuth = localStorage.getItem(import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION);
      const authData = storedAuth ? JSON.parse(storedAuth) : null;
      const token = authData?.access_token;

      if (!token) {
        window.location.href = '/auth/login';
        return;
      }

      const url = `${import.meta.env.VITE_APP_API_URL}/categories`;
      const res = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const mainCategories = res.data?.data ?? [];
      setCategories(mainCategories);
    } catch (err) {
      console.error('❌ Error fetching main categories:', err);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMainCategories();
  }, []);

  const getCategoryStyle = (categoryId) => {
    switch (categoryId) {
      case 1: return 'btn-success'; // Accommodation
      case 2: return 'btn-warning'; // Food & Drink
      case 3: return 'btn-info'; // Transportation
      case 4: return 'btn-primary'; // Tours & Trips
      case 5: return 'btn-secondary'; // Activities
      default: return 'btn-outline';
    }
  };



  return (
    <select 
      className={`select select-md select-bordered rounded-md ${
        selectedCategory ? getCategoryStyle(selectedCategory) : 'btn-outline'
      }`}
      value={selectedCategory || ''}
      onChange={(e) => onCategoryChange(e.target.value)}
      disabled={loading}
    >
      <option value="">All Categories</option>
      {categories.map((category) => (
        <option key={category.id} value={category.id}>
          {category.sp_type_title}
        </option>
      ))}
    </select>
  );
};

MainCategorySelect.propTypes = {
  selectedCategory: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onCategoryChange: PropTypes.func.isRequired,
};

export default MainCategorySelect; 