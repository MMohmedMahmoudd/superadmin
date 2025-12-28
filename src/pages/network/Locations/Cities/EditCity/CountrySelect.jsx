import { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import PropTypes from 'prop-types';
const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? 'dark:bg-gray-200 ' // Tailwind class for hover background
        : 'dark:bg-gray-200', // Tailwind class for default background
      borderColor: state.isFocused
        ? 'border-hover-border' // Tailwind class for hover border
        : 'border-border ', // Tailwind class for default border
      boxShadow: state.isFocused ? 'shadow-focus' : 'none', // Tailwind shadow class
      '&:hover': {
        borderColor: 'border-hover-border', // Tailwind class for hover border
      },
      color: 'var(--text)', // Tailwind class for text color
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'var(--menu-bg)', // Tailwind classes for light/dark mode
      borderRadius: '8px', // Tailwind class for rounded corners
      boxShadow: 'shadow-lg', // Tailwind class for shadow
      maxHeight: 'max-h-[200px]',
      color: 'var(--text)', // Tailwind class for text color
      // Tailwind class for max height
      overflowY: 'auto', // Tailwind class for overflow
      scrollbarWidth: 'thin', // Tailwind class for scrollbar width
      scrollbarColor: 'scrollbar-thumb scrollbar-bg', // Tailwind classes for scrollbar colors
      '&::-webkit-scrollbar': {
        width: 'w-2', // Tailwind class for scrollbar width
      },
      '&::-webkit-scrollbar-track': {
        background: 'bg-scrollbar-bg dark:bg-scrollbar-bg-dark', // Tailwind classes for light/dark mode
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'bg-scrollbar-thumb dark:bg-scrollbar-thumb-dark', // Tailwind classes for light/dark mode
        '&:hover': {
          background: 'bg-scrollbar-hover dark:bg-scrollbar-hover-dark', // Tailwind classes for light/dark mode
        },
      },
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? 'bg-option-hover dark:bg-option-hover-dark' // Tailwind classes for light/dark mode
        : 'bg-menu-bg dark:bg-menu-bg-dark', // Tailwind classes for light/dark mode
        '&:hover': {
          backgroundColor: 'var(--menu-w-bg) ', // Tailwind classes for light/dark mode
        },
    
      color: state.isSelected
        ? 'text-selected-text dark:text-selected-text-dark' // Tailwind classes for light/dark mode
        : 'text-text dark:text-text-dark ', // Tailwind classes for light/dark mode
      cursor: 'pointer', // Tailwind class for pointer cursor
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'var(--text) ', // Tailwind classes for light/dark mode
    }),
  placeholder: (provided) => ({
      ...provided,
      color: "var(--bs-gray-500)",
      fontSize: "0.875rem",
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: "var(--bs-gray-500)",
      "&:hover": {
        color: "var(--bs-primary)",
      },
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: "var(--bs-gray-500)",
      "&:hover": {
        color: "var(--bs-danger)",
      },
    }),
    input: (provided) => ({
      ...provided,
      color: "var(--bs-white)",
    }),
  };

const CountrySelect = ({
  formik,
  fieldName = 'country_uid',
  label = 'Country',
  placeholder = 'Select Country',
}) => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        const token = JSON.parse(localStorage.getItem(
          import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION
        ))?.access_token;

        const response = await axios.get(`${import.meta.env.VITE_APP_API_URL}/countries/list?filter[status]=1`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setCountries(response.data?.data || []);
      } catch (error) {
        console.error('Failed to fetch countries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCountries();
  }, []);

  const options = countries.map(country => ({
    value: country.id,
    label: country.name,
  }));

  const handleChange = (selectedOption) => {
    formik.setFieldValue(fieldName, selectedOption ? selectedOption.value : '');
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="form-label mb-1">{label}</label>
      <Select
        classNamePrefix="react-select"
        isLoading={loading}
        options={options}
        value={options.find(opt => opt.value === Number(formik.values[fieldName])) || null}
        onChange={handleChange}
        placeholder={placeholder}
        styles={customStyles}
      />
      {formik.touched[fieldName] && formik.errors[fieldName] && (
        <p className="text-red-500 text-xs mt-1">{formik.errors[fieldName]}</p>
      )}
    </div>
  );
};

CountrySelect.propTypes = {
  formik: PropTypes.object.isRequired,
  fieldName: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string.isRequired,
};

export { CountrySelect };
