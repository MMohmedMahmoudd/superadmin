import { ImageInput } from '@/components/image-input';
import { useState } from 'react';
import { KeenIcon } from '@/components';
import { toAbsoluteUrl } from '@/utils';

const CrudAvatarUpload = ({ onFileChange, avatarURL }) => {
  const [avatar, setAvatar] = useState(
    avatarURL ? [{ dataURL: avatarURL }] : []
  );

  const handleAvatarChange = (selectedAvatar) => {
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
        <div className="image-input size-24" onClick={onImageUpload}>
          <div
            className="btn btn-icon btn-icon-xs btn-light shadow-default absolute z-1 size-5 -top-0.5 -end-0.5 rounded-full"
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

          <div
            className="image-input-placeholder rounded-lg border-2 border-success image-input-empty:border-gray-300"
            style={{
              backgroundImage: `url(${
                avatar.length > 0 ? avatar[0].dataURL : toAbsoluteUrl("/media/avatars/blank.png")
              })`,
            }}
          >
            {avatar.length > 0 && <img src={avatar[0].dataURL} alt="avatar" />}
          </div>
        </div>
      )}
    </ImageInput>
  );
};
export { CrudAvatarUpload };
