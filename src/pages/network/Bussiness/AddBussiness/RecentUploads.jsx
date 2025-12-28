import { useState } from 'react';
import { KeenIcon, Menu, MenuItem, MenuToggle } from '@/components';
import { toAbsoluteUrl } from '@/utils/Assets';
import { DropdownCardItem1 } from '@/partials/dropdowns/general';
import PropTypes from 'prop-types';

const EXTENSION_ICON_MAP = {
  pdf: 'pdf.svg',
  doc: 'word.svg',
  docx: 'word.svg',
  xls: 'excel.svg',
  xlsx: 'excel.svg',
  csv: 'excel.svg',
  ppt: 'ppt.svg',
  pptx: 'powerpoint.svg',
  txt: 'txt.svg',
  rtf: 'text.svg',
  md: 'text.svg',
  js: 'javascript.svg',
  ts: 'javascript.svg',
  jsx: 'javascript.svg',
  tsx: 'javascript.svg',
  css: 'css.svg',
  html: 'text.svg',
  json: 'text.svg',
  sql: 'sql.svg',
  php: 'php.svg',
  ai: 'ai.svg',
  psd: 'psd.svg',
  fig: 'figma.svg',
  apk: 'apk.svg',
  ttf: 'ttf.svg',
  otf: 'font.svg',
  zip: 'zip.svg',
  rar: 'zip.svg',
  iso: 'iso.svg',
  mp3: 'mp3.svg',
  wav: 'music.svg',
  mp4: 'video.svg',
  mov: 'video-1.svg',
  avi: 'video-1.svg',
  svg: 'svg.svg',
};

const RecentUploads = ({ title, setFieldValue }) => {
  const [items, setItems] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();
    const isImage = file.type.startsWith('image/');
    const icon = EXTENSION_ICON_MAP[extension] || 'file.svg';

    const newItem = {
      icon,
      preview: isImage ? URL.createObjectURL(file) : null,
      desc: file.name,
      date: `${(file.size / (1024 * 1024)).toFixed(1)} MB • ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
      file,
    };

    setItems((prevItems) => {
      const newList = [...prevItems, newItem];
      const uploadedFiles = newList.map(item => item.file);
      if (typeof setFieldValue === 'function') {
        setFieldValue('sp_license_image', uploadedFiles);
      }
      return newList;
    });
  };

  const handleDelete = (indexToRemove) => {
    const updatedItems = items.filter((item, i) => {
      if (i === indexToRemove && item.preview) {
        URL.revokeObjectURL(item.preview);
      }
      return i !== indexToRemove;
    });
    setItems(updatedItems);
    const uploadedFiles = updatedItems.map(item => item.file);
    if (typeof setFieldValue === 'function') {
      setFieldValue('sp_license_image', uploadedFiles);
    }
  };

  const handleExport = (item) => {
    const fileURL = URL.createObjectURL(item.file);
    const a = document.createElement('a');
    a.href = fileURL;
    a.download = item.file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const renderItem = (item, index) => {
    const imageSrc = item.preview || toAbsoluteUrl(`/media/file-types/${item.icon}`);

    return (
      <div key={index} className="flex items-center gap-3">
        <div className="flex items-center grow gap-2.5">
          <img src={imageSrc} alt="" className="h-10 w-10 object-cover rounded" />
          <div className="flex flex-col">
            <span className="text-sm flex max-w-[200px] flex-wrap font-medium text-gray-900 cursor-pointer hover:text-primary mb-px">
              {item.desc}
            </span>
            <span className="text-xs text-gray-700">{item.date}</span>
          </div>
        </div>
        <Menu>
  <MenuItem
    toggle="dropdown"
    trigger="click"
    dropdownProps={{
      placement: 'bottom-end',
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [0, 10],
          },
        },
      ],
    }}
  >
    <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
      <KeenIcon icon="dots-vertical" />
    </MenuToggle>

    {/* This must return valid <MenuSub><MenuItem> structure */}
    {DropdownCardItem1({
      onDelete: () => handleDelete(index),
      onExport: () => handleExport(item),
    })}
  </MenuItem>
</Menu>
      </div>
    );
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">{title}</h3>
        <div>
          <label htmlFor="upload-file" className="btn btn-sm btn-outline btn-primary cursor-pointer">
            <i className="ki-filled ki-plus-squared"></i> Upload
          </label>
          <input
            id="upload-file"
            type="file"
            className="hidden"
            accept="*/*"
            onChange={handleFileUpload}
          />
        </div>
      </div>
      <div className="card-body">
        <div className="grid gap-2.5 lg:gap-5">
          {items.map((item, index) => renderItem(item, index))}
        </div>
      </div>
    </div>
  );
};

RecentUploads.propTypes = {
  title: PropTypes.string.isRequired,
  setFieldValue: PropTypes.func.isRequired,
};

export { RecentUploads };
