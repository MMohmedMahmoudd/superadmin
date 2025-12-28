import { useEffect, useState, useCallback } from 'react'; // ✅
import axios from 'axios';
import Select from 'react-select';
import PropTypes from 'prop-types';
import { customStyles } from '../../Bussiness/AddBussiness/PersonNameSelect'; // Adjust path
import { useNavigate } from 'react-router-dom';
const BusinessSelect = ({ formik }) => {
  const [allBusinesses, setAllBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const navigate = useNavigate();
  // 🔵 Debounce user input

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);
    
  const fetchBusinesses = useCallback(async () => {
    try {
      setLoading(true);
  
      // Get auth token
      const storedAuth = localStorage.getItem(import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION);
      const authData = storedAuth ? JSON.parse(storedAuth) : null;
      const token = authData?.access_token;
  
      if (!token) {
        navigate('/auth/login');
        return;
      }
  
      // Prepare base URL
      let baseUrl = `${import.meta.env.VITE_APP_API_URL}/providers/list?perPage=100`;
  
      let businesses = [];
      let currentPage = 1;
      let hasMore = true;
  
      while (hasMore) {
        const url = `${baseUrl}&page=${currentPage}`;
        const res = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const data = res.data?.data ?? [];
        businesses = [...businesses, ...data];
  
        const pagination = res.data?.pagination;
        if (!pagination || pagination.current_page >= pagination.last_page) {
          hasMore = false;
        } else {
          currentPage++;
        }
      }
  
      setAllBusinesses(businesses); // ⬅️ Save the full businesses
    } catch (error) {
      console.error('❌ Error fetching businesses:', error);
      setAllBusinesses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, []);
  

  const selectedBusiness = allBusinesses.find(b => b.id.toString() === formik?.values?.sp_uid?.toString());
  const selectedOption = selectedBusiness ? {
    value: selectedBusiness.id,
    label: selectedBusiness.name || 'Unnamed Business',
    image: selectedBusiness.image || '/media/avatars/blank.png',
    fullData: selectedBusiness,
  } : null;

  return (
    <div className="flex flex-col gap-1">
      <Select
  onInputChange={(inputValue, { action }) => {
    if (action === 'input-change') {
      setSearch(inputValue); // typing => update search
    }
    if (action === 'menu-close') {
      setSearch(''); // closing => reset search
    }
  }}
  options={allBusinesses.map((business) => ({
    value: business.id,
    label: business.name || 'Unnamed Business',
    image: business.image || '/media/avatars/blank.png',
    fullData: business,
  }))}
  value={selectedOption}
  filterOption={(option, input) => {
    const searchTerm = input.toLowerCase().trim();
    const label = option.data.label?.toLowerCase() || '';
    const code = option.data.fullData?.code?.toLowerCase() || '';
    const userName = option.data.fullData?.user?.name?.toLowerCase() || '';
    const id = option.data.fullData?.id?.toString() || '';
  
    const isNumericSearch = /^\d+$/.test(searchTerm);
  
    if (isNumericSearch) {
      // If search is a number, match ONLY by ID
      return id === searchTerm;
    } else {
      // Otherwise, match by label, code, or userName
      return (
        label.includes(searchTerm) ||
        code.includes(searchTerm) ||
        userName.includes(searchTerm)
      );
    }
  }}
       // filtered already ✅
  placeholder="Select Business"
  isLoading={loading || (search !== debouncedSearch)}
onChange={(selected) => {
  formik.setFieldValue('businessData', selected?.fullData || '');
  formik.setFieldValue('sp_uid', selected?.value || '');

  // 🧹 Reset related fields when changing business
  formik.setFieldValue('branch_uid', '');
  formik.setFieldValue('offer_uid', '');
  formik.setFieldValue('offerData', null);
  formik.setFieldValue('selectedOptions', []);
}}
  getOptionLabel={(e) => (
    <div className="flex items-center gap-2">
      <img
        src={e.image}
        alt={e.label}
        loading='lazy'
        className="w-6 h-6 object-cover rounded-full"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = '/media/avatars/blank.png';
        }}
      />
      {e.label}
    </div>
  )}
  styles={customStyles}
  isClearable
  noOptionsMessage={() => {
    if (loading) return 'Loading...';
    return 'No businesses available';
  }}
              />
      {formik.touched.sp_uid && formik.errors.sp_uid && (
        <p className="text-red-500 text-xs mt-1">{formik.errors.sp_uid}</p>
      )}
    </div>
  );
};

BusinessSelect.propTypes = {
  formik: PropTypes.object.isRequired,
  // Removed selectedCity propType
};

export { BusinessSelect };
