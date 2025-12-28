import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { toAbsoluteUrl } from '@/utils';

const CrudVideoUpload = ({ onVideoChange, initialVideo = null }) => {
  const [video, setVideo] = useState(initialVideo);

  const handleVideoChange = (file) => {
    if (file && file.type.startsWith('video/')) {
      setVideo(file);
      onVideoChange(file);
    } else {
      console.warn('Please select a valid video file');
    }
  };

  const removeVideo = () => {
    setVideo(null);
    onVideoChange(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleVideoChange(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    if (initialVideo) {
      setVideo(initialVideo);
    }
  }, [initialVideo]);

  return (
    <div className="w-full">
      <div
        className="relative w-full h-48 flex items-center justify-center bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        {video ? (
          <div className="relative w-full h-full">
            <video
              src={
                video?.preview ||
                (typeof video === 'string' ? video : URL.createObjectURL(video))
              }
              controls
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = toAbsoluteUrl("/media/avatars/blank.png");
              }}
            />
            <button
              type="button"
              className="absolute top-2 right-2 bg-red-500 text-white text-sm rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
              onClick={removeVideo}
              title="Remove video"
            >
              ✕
            </button>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer">
            <input
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => handleVideoChange(e.target.files[0])}
            />
            <div className="flex flex-col items-center gap-2">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              <span className="text-gray-500 text-sm font-medium">Click to upload video</span>
              <span className="text-gray-400 text-xs">or drag and drop</span>
            </div>
          </label>
        )}
      </div>
      <p className="text-sm text-center text-gray-500 mt-2">
        Only *.mp4, *.mov, *.avi, *.webm video files are accepted.
      </p>
    </div>
  );
};

CrudVideoUpload.propTypes = {
  onVideoChange: PropTypes.func.isRequired,
  initialVideo: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
};

export { CrudVideoUpload };

