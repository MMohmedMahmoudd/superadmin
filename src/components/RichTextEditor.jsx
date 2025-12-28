import PropTypes from 'prop-types';
import ReactQuill from 'react-quill';
import { useRef, forwardRef } from 'react';
import 'react-quill/dist/quill.snow.css';
import '@/css/styles.css';

const modules = {
  toolbar: [
    ['bold', 'italic', 'underline'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['clean']
  ]
};

const formats = [
  'bold', 'italic', 'underline',
  'list', 'bullet',
  'clean'
];

// StrictMode-safe wrapper for ReactQuill
const StrictModeDroppable = ({ children }) => {
  return children;
};

StrictModeDroppable.propTypes = {
  children: PropTypes.node.isRequired,
};

const RichTextEditor = forwardRef(({ name, value, onChange, onBlur, placeholder = 'Write here...', className = '', id }, ref) => {
  const quillRef = useRef(null);
  
  // Handler for react-quill
  const handleChange = (content) => {
    onChange(name, content);
  };

  const handleBlur = () => {
    if (onBlur) {
      onBlur(name);
    }
  };

  // Check if RTL class is present
  const isRTL = className.includes('rtl');

  return (
    <div 
      ref={ref}
      className={`w-full mb-4 border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-100 ${className}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <StrictModeDroppable>
        <ReactQuill
          ref={quillRef}
          id={id}
          theme="snow"
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          className={`custom-quill-editor ${isRTL ? 'quill-rtl' : ''}`}
          preserveWhitespace={false}
        />
      </StrictModeDroppable>
      <style dangerouslySetInnerHTML={{
        __html: `
          .quill-rtl .ql-editor {
            direction: rtl;
            text-align: right;
          }
          .quill-rtl .ql-toolbar {
            direction: rtl;
          }
          .quill-rtl .ql-toolbar .ql-formats {
            margin-right: 0;
            margin-left: 5px;
          }
        `
      }} />
    </div>
  );
});

RichTextEditor.displayName = 'RichTextEditor';

RichTextEditor.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
};

export default RichTextEditor; 