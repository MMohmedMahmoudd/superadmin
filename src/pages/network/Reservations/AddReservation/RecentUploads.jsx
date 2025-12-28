// import { Link } from 'react-router-dom';
// import { useLanguage } from '@/i18n';
// import { KeenIcon, Menu, MenuItem, MenuToggle } from '@/components';
// import { toAbsoluteUrl } from '@/utils/Assets';
// import { DropdownCardItem1 } from '@/partials/dropdowns/general';
// import { useState } from 'react';

// const RecentUploads = ({
//   title,setFieldValue 
// }) => {
//   const {
//     isRTL
//   } = useLanguage();

//   const [items, setItems] = useState([
//   ]);
//   const handleFileUpload = (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     const extension = file.name.split('.').pop().toLowerCase();
//     let icon = 'file.svg'; // fallback

//     if (extension === 'pdf') icon = 'pdf.svg';
//     else if (extension === 'doc' || extension === 'docx') icon = 'doc.svg';
//     else if (extension === 'js') icon = 'js.svg';
//     else if (extension === 'ai') icon = 'ai.svg';

//     const newItem = {
//       image: icon,
//       desc: file.name,
//       date: `${(file.size / (1024 * 1024)).toFixed(1)} MB • ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
//       file, // keep the file itself if needed later

//     };

//     setItems((prevItems) => {
//       const newList = [...prevItems, newItem];
    
//       // Extract just the file objects
//       const uploadedFiles = newList.map(item => item.file);
    
//       // 🔥 Pass them to Formik
//       if (typeof setFieldValue === 'function') {
//         setFieldValue('sp_license_image', uploadedFiles);
//       }
    
//       return newList;
//     });
//       };

//   const renderItem = (item, index) => {
//     return <div key={index} className="flex items-center gap-3">
//         <div className="flex items-center grow gap-2.5">
//           <img src={toAbsoluteUrl(`/media/file-types/${item.image}`)} alt="" />

//           <div className="flex flex-col">
//             <span className="text-sm font-medium text-gray-900 cursor-pointer hover:text-primary mb-px">
//               {item.desc}
//             </span>
//             <span className="text-xs text-gray-700">{item.date}</span>
//           </div>
//         </div>

//         <Menu>
//           <MenuItem toggle="dropdown" trigger="click" dropdownProps={{
//           placement: isRTL() ? 'bottom-start' : 'bottom-end',
//           modifiers: [{
//             name: 'offset',
//             options: {
//               offset: isRTL() ? [0, -10] : [0, 10] // [skid, distance]
//             }
//           }]
//         }}>
//             <MenuToggle className="btn btn-sm btn-icon btn-light btn-clear">
//               <KeenIcon icon="dots-vertical" />
//             </MenuToggle>
//             {DropdownCardItem1()}
//           </MenuItem>
//         </Menu>
//       </div>;
//   };
//   return <div className="card">
//       <div className="card-header">
//         <h3 className="card-title">{title}</h3>
//         {/* Upload Button */}
//         <div>
//           <label htmlFor="upload-file" className="btn btn-sm  btn-outline btn-primary cursor-pointer">
//           <i className="ki-filled ki-plus-squared"></i>  Upload 
//           </label>
//           <input
//             id="upload-file"
//             type="file"
//             className="hidden btn btn-sm  btn-outline-primary cursor-pointer"
//             accept=".pdf,.doc,.docx,.js,.ai"
//             onChange={handleFileUpload}
//           />
//         </div>

//       </div>

//       <div className="card-body">
//         <div className="grid gap-2.5 lg:gap-5">
//           {items.map((item, index) => {
//           return renderItem(item, index);
//         })}
//         </div>
//       </div>
//     </div>;
// };
// export { RecentUploads };

// import { Link } from 'react-router-dom';
// import { useLanguage } from '@/i18n';
import { useState } from 'react';
import { KeenIcon, Menu, MenuItem, MenuToggle } from '@/components';
import { toAbsoluteUrl } from '@/utils/Assets';
import { DropdownCardItem1 } from '@/partials/dropdowns/general';

const RecentUploads = ({ title, setFieldValue }) => {
  const [items, setItems] = useState([]);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const extension = file.name.split('.').pop().toLowerCase();
    let icon = 'file.svg';

    if (extension === 'pdf') icon = 'pdf.svg';
    else if (extension === 'doc' || extension === 'docx') icon = 'doc.svg';
    else if (extension === 'js') icon = 'js.svg';
    else if (extension === 'ai') icon = 'ai.svg';

    const newItem = {
      image: icon,
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
    const updatedItems = items.filter((_, i) => i !== indexToRemove);
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
    return (
      <div key={index} className="flex items-center gap-3">
        <div className="flex items-center grow gap-2.5">
          <img src={toAbsoluteUrl(`/media/file-types/${item.image}`)} alt="" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-900 cursor-pointer hover:text-primary mb-px">
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
            accept=".pdf,.doc,.docx,.js,.ai"
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

export { RecentUploads };
