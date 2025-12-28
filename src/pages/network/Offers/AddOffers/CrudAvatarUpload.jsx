import { ImageInput } from '@/components/image-input';
import { useState, useEffect } from 'react';
import { KeenIcon } from '@/components';
import { toAbsoluteUrl } from '@/utils';

/* eslint-disable react/prop-types */
const CrudAvatarUpload = ({ onFileChange, avatarURL, maxFiles = 8 }) => {
  // Support both single URL string and array of URLs/images
  const initialAvatars = Array.isArray(avatarURL) 
    ? avatarURL.map(url => ({ dataURL: url }))
    : avatarURL 
      ? [{ dataURL: avatarURL }] 
      : [];

  const [avatars, setAvatars] = useState(initialAvatars);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Sync with prop changes
  useEffect(() => {
    const newAvatars = Array.isArray(avatarURL) 
      ? avatarURL.map(url => ({ dataURL: url }))
      : avatarURL 
        ? [{ dataURL: avatarURL }] 
        : [];
    setAvatars(newAvatars);
  }, [avatarURL]);

  const handleAvatarChange = (selectedAvatars) => {
    setAvatars(selectedAvatars);
    // Extract File objects from selectedAvatars in order
    const imageFiles = selectedAvatars
      .filter(item => item.file instanceof File)
      .map(item => item.file);
    // Also pass the ordered dataURLs so parent can maintain preview order
    const imageURLs = selectedAvatars
      .map(item => item.dataURL)
      .filter(url => url);
    onFileChange(imageFiles, imageURLs);
  };

  const handleRemove = (index, e) => {
    e.stopPropagation();
    const updated = [...avatars];
    updated.splice(index, 1);
    setAvatars(updated);
    // Extract File objects from updated avatars in order
    const imageFiles = updated
      .filter(item => item.file instanceof File)
      .map(item => item.file);
    // Also pass the ordered dataURLs
    const imageURLs = updated
      .map(item => item.dataURL)
      .filter(url => url);
    onFileChange(imageFiles, imageURLs);
  };

  // Drag and drop handlers for reordering
  const handleDragStart = (index, e) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target);
  };

  const handleDragOver = (index, e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (dropIndex, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...avatars];
    const draggedItem = updated[draggedIndex];
    updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, draggedItem);
    
    setAvatars(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
    
    // Notify parent of new order
    const imageFiles = updated
      .filter(item => item.file instanceof File)
      .map(item => item.file);
    // Also pass the ordered dataURLs
    const imageURLs = updated
      .map(item => item.dataURL)
      .filter(url => url);
    onFileChange(imageFiles, imageURLs);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <ImageInput value={avatars} onChange={handleAvatarChange} multiple>
      {({ onImageUpload }) => (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {avatars.map((avatar, index) => (
              <div
                key={index}
                className="relative group"
                draggable
                onDragStart={(e) => handleDragStart(index, e)}
                onDragOver={(e) => handleDragOver(index, e)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(index, e)}
                onDragEnd={handleDragEnd}
              >
                <div
                  className={`image-input size-24 cursor-move relative ${
                    draggedIndex === index ? 'opacity-50' : ''
                  } ${
                    dragOverIndex === index ? 'ring-2 ring-primary' : ''
                  }`}
                >
                  <div
                    className="btn btn-icon btn-icon-xs btn-light shadow-default absolute z-10 size-5 -top-0.5 -end-0.5 rounded-full"
                    onClick={(e) => handleRemove(index, e)}
                  >
                    <KeenIcon icon="cross" />
                  </div>
                  
                  {/* Drag handle indicator */}
                  <div className="absolute top-1 left-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <KeenIcon icon="menu" className="text-gray-600 text-xs" />
                  </div>

                  <div
                    className="image-input-placeholder rounded-lg border-2 border-success image-input-empty:border-gray-300"
                    style={{
                      backgroundImage: `url(${
                        avatar.dataURL || toAbsoluteUrl("/media/avatars/blank.png")
                      })`,
                    }}
                  >
                    <img 
                      src={avatar.dataURL || toAbsoluteUrl("/media/avatars/blank.png")} 
                      alt={`upload ${index + 1}`} 
                      className="rounded-lg object-cover w-full h-full"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = toAbsoluteUrl("/media/avatars/blank.png");
                      }} 
                    />
                  </div>
                </div>
              </div>
            ))}
            
            {/* Add new image button */}
            {avatars.length < maxFiles && (
              <div
                className="image-input size-24 cursor-pointer border-2 border-dashed border-gray-300 hover:border-primary transition-colors"
                onClick={onImageUpload}
              >
                <div className="image-input-placeholder rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100">
                  <KeenIcon icon="plus" className="text-gray-400 text-2xl mb-1" />
                  <span className="text-xs text-gray-500">Add</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </ImageInput>
  );
};

export { CrudAvatarUpload };
