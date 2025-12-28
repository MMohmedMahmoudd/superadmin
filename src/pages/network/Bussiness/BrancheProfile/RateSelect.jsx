import React from 'react';
import Select from 'react-select';
import PropTypes from 'prop-types';
import { Rating } from '@mui/material';

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
      color: 'var(--text)', // Tailwind class for text color
      // Tailwind class for max height
      scrollbarWidth: 'thin', // Tailwind class for scrollbar width
      scrollbarColor: 'scrollbar-thumb scrollbar-bg', // Tailwind classes for scrollbar colors
      position: 'absolute',
      width: '100%',
      maxHeight: 'max-h-[200px]',
      overflowY: 'auto',
      zIndex: 999,
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
    menuList: (provided) => ({
      ...provided,
      padding: '8px',
      zIndex: 9999,
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

const options = [
  { value: '', label: 'All Ratings' },
  { value: '5',  icon: <Rating value={5} readOnly precision={0.5} className="text-yellow-400" /> },
  { value: '4.5',  icon: <Rating value={4.5} readOnly precision={0.5} className="text-yellow-400" /> },
  { value: '4',  icon: <Rating value={4} readOnly precision={0.5} className="text-yellow-400" /> },
  { value: '3.5',  icon: <Rating value={3.5} readOnly precision={0.5} className="text-yellow-400" /> },
  { value: '3',  icon: <Rating value={3} readOnly precision={0.5} className="text-yellow-400" /> },
  { value: '2.5',  icon: <Rating value={2.5} readOnly precision={0.5} className="text-yellow-400" /> },
  { value: '2',  icon: <Rating value={2} readOnly precision={0.5} className="text-yellow-400" /> },
  { value: '1.5',  icon: <Rating value={1.5} readOnly precision={0.5} className="text-yellow-400" /> },
  { value: '1',  icon: <Rating value={1} readOnly precision={0.5} className="text-yellow-400" /> },
];

 const RateSelect = ({ value, onChange, className }) => (
  <Select
    classNamePrefix="react-select"
    options={options}
    value={options.find(opt => opt.value === value) || options[0]}
    onChange={selected => onChange(selected.value)}
    placeholder="Filter by Rating"
    styles={customStyles}
    className={className}
    formatOptionLabel={option => (
      <div className="flex items-center gap-2">
        {option.icon}
        <span>{option.label}</span>
      </div>
    )}
  />
);
RateSelect.propTypes = {
    value: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    className: PropTypes.string,
  };
  
export  {RateSelect};
