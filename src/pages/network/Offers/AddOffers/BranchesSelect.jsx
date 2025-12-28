import React, { useState, useEffect, useMemo } from 'react';
import Select from 'react-select';
import axios from 'axios';
import PropTypes from 'prop-types';
import { customStyles } from '../../Bussiness/AddBussiness/PersonNameSelect'; // Adjust path
const customMultiValueStyles = {
  multiValue: (base) => ({
    ...base,
    backgroundColor: '#f0f0f0', // Badge background
    borderRadius: '9999px',      // Full rounded
    padding: '2px 6px',
    display: 'flex',
    alignItems: 'center',
    fontSize: '12px',
    color: '#333',
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: '#333',
    fontWeight: '500',
    padding: '0 4px',
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: '#666',
    borderRadius: '50%',
    ':hover': {
      backgroundColor: '#F44336',
      color: '#fff',
      width: '20px',
      height: '20px',
      cursor:'pointer'

    },
  }),
};

const normalizeLabel = (name, fallback) => {
  if (!name) return fallback;
  if (typeof name === 'string') return name.trim();
  if (typeof name === 'object') {
    return name.en?.trim() || name.ar?.trim() || fallback;
  }
  return fallback;
};

const normalizeCityName = (name) => {
  if (!name) return '';
  if (typeof name === 'string') return name.trim();
  if (typeof name === 'object') return name.en?.trim() || name.ar?.trim() || '';
  return '';
};

const BranchesSelect = ({ providerId, selectedCity,formik }) => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchBranches = async () => {
      if (!providerId) return;

      setLoading(true);
      try {
        const storedAuth = localStorage.getItem(import.meta.env.VITE_APP_NAME + '-auth-v' + import.meta.env.VITE_APP_VERSION);
        const authData = storedAuth ? JSON.parse(storedAuth) : null;
        const token = authData?.access_token;
        if (!token) {
          window.location.href = '/auth/login';
          return;
        }

        const res = await axios.get(`${import.meta.env.VITE_APP_API_URL}/provider/${providerId}/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const branchesData = res.data?.data?.branches || [];

        const options = branchesData.map(branch => {
          let label = normalizeLabel(branch.name, '');
          if (!label) {
            label = branch.address?.trim() || branch.phone || 'Unnamed Branch';
          }

          return {
            value: branch.id,
            label,
            cityName: normalizeCityName(branch.city?.name), // ✅ Correct: pull branch.city.name
            fullData: branch
          };
        });

        const finalOptions = [
          { value: 'all', label: 'All Branches', cityName: 'All' },
          ...options
        ];

        setBranches(finalOptions);
      } catch (error) {
        console.error('❌ Error fetching branches:', error);
        setBranches([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBranches();
  }, [providerId]);

  const filteredBranches = useMemo(() => {
    if (!selectedCity || selectedCity.toLowerCase() === 'all cities') {
      return branches;
    }
    return branches.filter(branch => branch.cityName?.toLowerCase() === selectedCity.toLowerCase());
  }, [branches, selectedCity]);
  
  return (
    <Select
      className="react-select"
      classNamePrefix="select"
      isLoading={loading}
      options={filteredBranches}
      placeholder="Select Branch"
      isMulti={true}
      closeMenuOnSelect={false}
      onBlur={() => {
        formik.setFieldTouched('branches_id', true);
      }}
      value={filteredBranches.filter(opt => formik.values.branches_id?.includes(opt.value))}
      onChange={(selectedOptions) => {
        if (!selectedOptions) {
          formik.setFieldValue('branches_id', []);
          return;
        }
    
        const selectedValues = selectedOptions.map(option => option.value);
    
        if (selectedValues.includes('all')) {
          // User selected "All Branches"
          formik.setFieldValue('branches_id', ['all']);
        } else {
          formik.setFieldValue('branches_id', selectedValues);
        }
      }}
      isClearable
      getOptionLabel={(option) => option.label}
      getOptionValue={(option) => option.value}
      styles={{ ...customStyles,  ...customMultiValueStyles }}
    />
  );
};

BranchesSelect.propTypes = {
  providerId: PropTypes.string.isRequired,
  formik: PropTypes.object.isRequired,
  selectedCity: PropTypes.string
};

export  {BranchesSelect};
