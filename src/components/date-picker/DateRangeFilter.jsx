import { useState, useRef, useEffect } from 'react';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const DateRangeFilter = ({ onChange }) => {
  const [showPicker, setShowPicker] = useState(false);
  const pickerRef = useRef(null);

  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: 'selection',
    },
  ]);

  const handleApply = () => {
    setShowPicker(false);
    onChange({
      from: format(range[0].startDate, 'yyyy-MM-dd'),
      to: format(range[0].endDate, 'yyyy-MM-dd'),
    });
  };
  
  const handleReset = () => {
    const today = new Date();
    const resetRange = [{ startDate: today, endDate: today, key: 'selection' }];
    setRange(resetRange);
    onChange(today);
    setShowPicker(false);
  };

  // Hide picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative  inline-block z-5">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="  dark:bg-gray-100 w-40  px-4 py-1 rounded border border-gray-300 text-sm flex items-center gap-2 dark:text-white"
      >
        <i className="ki-outline ki-calendar text-xl">
</i>
 {format(range[0].startDate, 'MMM dd, yyyy')}
      </button>

      {showPicker && (
        <div
          ref={pickerRef}
          className="absolute top-full mt-2  -left-48 bg-white dark:bg-gray-100 text-black dark:text-white p-4 rounded-lg shadow-lg custom-range-picker z-5"
        >
          <DateRange
            onChange={(item) => setRange([item.selection])}
            showSelectionPreview={false}
            moveRangeOnFirstSelection={false}
            months={1}
            ranges={range}
            direction="horizontal"
            editableDateInputs={false}
            showDateDisplay={false}
            showMonthAndYearPickers={true}
            className='dark:bg-gray-100  dark:text-white '
          />

          <div className="flex justify-end gap-2 mt-4">
            <button onClick={handleReset} className="px-4 py-1 text-sm border btn-outline btn-primary rounded">Reset</button>
            <button onClick={handleApply} className="px-4 py-1 text-sm btn-outline btn-primary text-white rounded">Apply</button>
          </div>
        </div>
      )}
    </div>
  );
};

export { DateRangeFilter };
