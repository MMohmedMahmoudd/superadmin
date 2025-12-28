import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import 'flowbite';
import { Datepicker } from 'flowbite-datepicker';
import { format } from 'date-fns'; // TOP of your file

const FlowbiteHtmlDatepicker = ({ value, onChange,onBlur, name,  placeholder = "date", range = false, mode = 'day' }) => {
  const inputRef = useRef(null);
  const todayFormatted = format(new Date(), 'yyyy-MM-dd'); // Get today's date
  const inputValue = value || todayFormatted; // If no value, use today

  useEffect(() => {
    if (!inputRef.current) return;

    const datepicker = new Datepicker(inputRef.current, {
      format: 'yyyy-mm-dd',
      todayHighlight: true,
      animation: true,
    });

    inputRef.current.addEventListener('changeDate', (event) => {
      if (onChange) {
        const selectedDate = new Date(event.target.value); // Parse the selected value as Date
        if (!isNaN(selectedDate)) {
          const formattedDate = format(selectedDate, 'yyyy-MM-dd'); // Safe and consistent
          onChange({ target: { name: inputRef.current.name, value: formattedDate } });
        }
      }
      if (onBlur) {
        onBlur({ target: { name: inputRef.current.name } });
      }
    });
    
    return () => {
      datepicker.destroy();
    };
  }, [inputRef, onChange, onBlur, name]);

  return (
    <div className="relative ">
      <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-500 dark:text-gray-500"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
        </svg>
      </div>
      <input
      ref={inputRef}
      id="datepicker-actions"
      type="text"
      name={name}
      className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-200 dark:border-gray-400 dark:placeholder-gray-500 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      placeholder={placeholder}
      data-datepicker
      data-datepicker-buttons
      data-datepicker-autoselect-today
      data-range={range ? 'true' : undefined}
      data-pick-level={mode === 'month' ? 1 : 0}
      value={inputValue}
      onChange={onChange}
      onBlur={onBlur}
      autoComplete="off"
/>
    </div>
    
  );
};

FlowbiteHtmlDatepicker.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  range: PropTypes.bool,
  onBlur: PropTypes.func, 
  mode: PropTypes.oneOf(['day', 'month']),
  name: PropTypes.string,
};

export default FlowbiteHtmlDatepicker;