import PropTypes from 'prop-types';
import { useRef } from 'react';

const BLOCK_TYPES = [
  { label: 'Paragraph', value: 'p' },
  { label: 'Heading 1', value: 'h1' },
  { label: 'Heading 2', value: 'h2' },
  { label: 'Heading 3', value: 'h3' },
];

const FONT_FAMILIES = [
  { label: 'Default', value: '' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Times New Roman', value: 'Times New Roman, serif' },
  { label: 'Courier New', value: 'Courier New, monospace' },
  { label: 'Georgia', value: 'Georgia, serif' },
];

const FONT_SIZES = [
  { label: 'Normal', value: '16px' },
  { label: 'Small', value: '12px' },
  { label: 'Large', value: '20px' },
  { label: 'X-Large', value: '24px' },
];

const TextEditor = ({ name, value, onChange, placeholder = 'Write an article...', rows = 8 }) => {
  const textareaRef = useRef();

  // Helper to wrap selected text
  const wrapSelection = (before, after = before) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.slice(start, end);
    const newValue = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(name, newValue);
    // Restore selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  // Block type
  const handleBlockType = (e) => {
    const tag = e.target.value;
    if (!tag) return;
    wrapSelection(`<${tag}>`, `</${tag}>`);
  };

  // Font family
  const handleFontFamily = (e) => {
    const font = e.target.value;
    if (!font) return;
    wrapSelection(`<span style="font-family:${font}">`, '</span>');
  };

  // Font size
  const handleFontSize = (e) => {
    const size = e.target.value;
    if (!size) return;
    wrapSelection(`<span style="font-size:${size}">`, '</span>');
  };

  // Unordered list
  const handleUnorderedList = () => {
    wrapSelection('<ul><li>', '</li></ul>');
  };

  // Ordered list
  const handleOrderedList = () => {
    wrapSelection('<ol><li>', '</li></ol>');
  };

  // Handler for textarea changes
  const handleChange = (e) => {
    onChange(name, e.target.value);
  };

  return (
    <div className="w-full mb-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
      <div className="flex items-center justify-between px-3 py-2 border-b dark:border-gray-600 border-gray-200 gap-2 flex-wrap">
        {/* Block type dropdown */}
        <select className="select select-sm mr-2" onChange={handleBlockType} defaultValue="">
          <option value="">Block</option>
          {BLOCK_TYPES.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {/* Font family dropdown */}
        <select className="select select-sm mr-2" onChange={handleFontFamily} defaultValue="">
          <option value="">Font</option>
          {FONT_FAMILIES.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {/* Font size dropdown */}
        <select className="select select-sm mr-2" onChange={handleFontSize} defaultValue="">
          <option value="">Size</option>
          {FONT_SIZES.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        {/* List buttons */}
        <button type="button" title="Unordered List" className="p-2 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600" onClick={handleUnorderedList}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="6" cy="6" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="6" cy="18" r="2"/><line x1="10" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="10" y1="18" x2="20" y2="18"/></svg>
        </button>
        <button type="button" title="Ordered List" className="p-2 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600" onClick={handleOrderedList}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><text x="2" y="8" fontSize="8">1.</text><text x="2" y="14" fontSize="8">2.</text><text x="2" y="20" fontSize="8">3.</text><line x1="10" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="10" y1="18" x2="20" y2="18"/></svg>
        </button>
        {/* Existing toolbar buttons (icons only, not functional) */}
        <div className="flex items-center space-x-1 rtl:space-x-reverse sm:pe-4 ml-2">
          <button type="button" className="p-2 text-gray-500 rounded-sm cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
            <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 12 20">
              <path stroke="currentColor" strokeLinejoin="round" strokeWidth="2" d="M1 6v8a5 5 0 1 0 10 0V4.5a3.5 3.5 0 1 0-7 0V13a2 2 0 0 0 4 0V6"/>
            </svg>
            <span className="sr-only">Attach file</span>
          </button>
        </div>
        {/* Fullscreen button (not functional) */}
        <button type="button" data-tooltip-target="tooltip-fullscreen" className="p-2 text-gray-500 rounded-sm cursor-pointer sm:ms-auto hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600">
          <svg className="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 19 19">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 1h5m0 0v5m0-5-5 5M1.979 6V1H7m0 16.042H1.979V12M18 12v5.042h-5M13 12l5 5M2 1l5 5m0 6-5 5"/>
          </svg>
          <span className="sr-only">Full screen</span>
        </button>
      </div>
      <div className="px-4 py-2 bg-white rounded-b-lg dark:bg-gray-800">
        <label htmlFor={name} className="sr-only">{placeholder}</label>
        <textarea
          ref={textareaRef}
          id={name}
          name={name}
          rows={rows}
          className="block w-full px-0 text-sm text-gray-800 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
        />
      </div>
    </div>
  );
};

TextEditor.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  rows: PropTypes.number,
};

export default TextEditor; 