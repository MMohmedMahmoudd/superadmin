
import { ImageInput } from '@/components/image-input';
import { useState } from 'react';
import { KeenIcon } from '@/components';
import { toAbsoluteUrl } from '@/utils';
const CrudAvatarUpload = ({ onFileChange, avatarURL,hasError }) => {
  const [avatar, setAvatar] = useState(
    avatarURL ? [{ dataURL: avatarURL }] : []
  );

  const handleAvatarChange = (selectedAvatar) => {
    if (
      selectedAvatar.length > 0 &&
      selectedAvatar[0].file &&
      !['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/svg+xml'].includes(selectedAvatar[0].file.type)
    ) {
      alert('Only JPEG, PNG, JPG, GIF, or SVG images are allowed.');
      return;
    }
  
    setAvatar(selectedAvatar);
    if (selectedAvatar.length > 0 && selectedAvatar[0].file) {
      onFileChange(selectedAvatar[0].file);
    } else {
      onFileChange(null);
    }
  };
    return (
    <ImageInput value={avatar} onChange={handleAvatarChange}>
      {({ onImageUpload }) => (
        <div className="image-input size-40" onClick={onImageUpload}>
          <div
            className="btn btn-icon btn-icon-xs btn-light shadow-default absolute z-1 size-6 top-2 end-4 rounded-full"
            onClick={(e) => {
              e.stopPropagation();
              setAvatar([]); // Clear the avatar
              onFileChange(null); // Notify the parent component
            }}
          >
            <KeenIcon icon="cross" />
          </div>
          <span className="tooltip" id="image_input_tooltip">
            Click to remove or revert
          </span>

          {/* Show image preview (initialImage or uploaded one) */}
          <div
className={`image-input-placeholder rounded-full border-3 overflow-hidden w-48 h-48 ${
  hasError ? 'border-red-500' : 'border-success image-input-empty:border-gray-300'
}`}
            style={{
              backgroundImage: `url(${avatar.length > 0 ? avatar[0].dataURL : toAbsoluteUrl('/media/avatars/blank.png')})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
{avatar.length > 0 && (
  <img
    src={avatar[0].dataURL}
    alt="avatar"
    onError={(e) => {
      e.target.onerror = null; // Prevent endless loop if default also fails
      e.target.src = toAbsoluteUrl("/media/avatars/blank.png"); // Fallback to default
    }}
    className="w-full h-full object-cover"
  />
)}
          </div>
        </div>
      )}
    </ImageInput>
  );
};

export { CrudAvatarUpload };
