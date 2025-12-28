import { useEffect } from 'react';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { toAbsoluteUrl } from '@/utils';
const CrudMultiImageUpload = ({ onFilesChange, maxFiles = 8, initialFiles = [] }) => {
  const [files, setFiles] = useState(initialFiles);

  const handleFiles = (fileList) => {
    const selected = Array.from(fileList).slice(0, maxFiles - files.length);
    const updated = [...files, ...selected];
    setFiles(updated);
    onFilesChange(updated);
  };

  const removeFile = (index) => {
    const updated = [...files];
    updated.splice(index, 1);
    setFiles(updated);
    onFilesChange(updated);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleFiles(e.dataTransfer.files);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    if (initialFiles.length > 0) {
      setFiles(initialFiles);
    }
  }, [initialFiles]);
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8 gap-4"
    onDrop={handleDrop}
    onDragOver={handleDragOver}
    >
      {Array.from({ length: maxFiles }).map((_, idx) => (
        <div
          key={idx}
          className="relative  w-full h-32 flex items-center justify-between bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden"
          style={{
            backgroundImage: `url(${toAbsoluteUrl('/media/avatars/blank.png')})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}

        >
          {files[idx] ? (
            <>
              <img
                src={
                  files[idx]?.preview ||
                  (typeof files[idx] === 'string' ? files[idx] : URL.createObjectURL(files[idx]))
                }
                alt="uploaded"
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center "
                onClick={() => removeFile(idx)}
              >
                ✕
              </button>
            </>
          ) : (
            <>
              <label className="flex flex-col items-center justify-end w-full h-full cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
                <span className="text-gray-400 text-center text-xs font-medium">Click or Drag & Drop</span>

              </label>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

CrudMultiImageUpload.propTypes = {
  onFilesChange: PropTypes.func.isRequired,
  maxFiles: PropTypes.number,
  initialFiles: PropTypes.array,
};

export { CrudMultiImageUpload };
