import { useState, useEffect } from 'react';
import Select from 'react-select';
import axios from 'axios';
import { customStyles } from '../../Bussiness/AddBussiness/PersonNameSelect'; // Adjust path as needed
import PropTypes from 'prop-types';
import { toAbsoluteUrl } from '@/utils';
const normalizeLabel = (name, fallback = '') => {
  if (!name) return fallback;
  if (typeof name === 'string') return name.trim();
  if (typeof name === 'object') return name.en?.trim() || name.ar?.trim() || fallback;
  return fallback;
};

const CategorySelect = ({ typeId, formik, id, initialCategory }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      if (!typeId) {
        setOptions([]);
        return;
      }
      setLoading(true);
      try {
        const token = JSON.parse(localStorage.getItem(import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION))?.access_token;
        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/subcategories?filter[sp_type_uid]=${typeId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const subcategories = res.data?.data ?? [];
        const formattedOptions = subcategories.map(cat => ({
          label: normalizeLabel(cat.cat_name, 'Unnamed Category'),
          value: cat.id,
          image: cat.cat_image,
        }));

        setOptions(formattedOptions);

        // ✅ AUTO SELECT first category only if none set yet AND we're not editing (no initialCategory provided)
        if (!initialCategory && !formik.values.cat_uid && formattedOptions.length > 0) {
          formik.setFieldValue('cat_uid', formattedOptions[0].value.toString());
        }

      } catch (error) {
        console.error('Error fetching subcategories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typeId, initialCategory]);
    

  return (
    <div className="flex flex-col gap-1">
<Select
  inputId={id}
  isDisabled={!typeId}
  isLoading={loading}
  options={options}
  placeholder={typeId ? "Select Category" : "Please select a business first"}
  value={options.find(opt => opt.value.toString() === formik.values.cat_uid?.toString()) || null}
  onChange={(selected) => {
    formik.setFieldValue('cat_uid', selected?.value || '');
    formik.setFieldTouched('cat_uid', true, false); // ✅ Mark as touched
  }}
  onBlur={() => formik.setFieldTouched('cat_uid', true)}
  getOptionLabel={(e) => (
    <div className="flex items-center gap-2">
      <img
        src={e.image || toAbsoluteUrl('/media/avatars/blank.png')}
        alt={e.label}
        className="w-6 h-6 object-cover rounded-full"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = toAbsoluteUrl('/media/avatars/blank.png');
        }}
      />
      {e.label}
    </div>
  )}
  
  styles={customStyles}
/>

{formik.touched.cat_uid && formik.errors.cat_uid && (
  <p className="text-red-500 text-xs mt-1">{formik.errors.cat_uid}</p>
)}
    </div>
  );
};

CategorySelect.propTypes = {
  typeId: PropTypes.string.isRequired,
  formik: PropTypes.object.isRequired,
  id: PropTypes.string,
  initialCategory: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
};

export { CategorySelect };
