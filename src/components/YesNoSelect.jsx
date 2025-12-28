import React from 'react';

const YesNoSelect = ({ 
  value, 
  onChange, 
  onBlur, 
  name, 
  id, 
  className = "select", 
  placeholder = "Select option",
  disabled = false,
  error = false
}) => {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      className={`${className} ${error ? 'border-red-500' : ''}`}
      disabled={disabled}
    >
      <option value="">{placeholder}</option>
      <option value="1">Yes</option>
      <option value="0">No</option>
    </select>
  );
};

export default YesNoSelect;

