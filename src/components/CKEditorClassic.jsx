import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { CKEditor } from 'ckeditor4-react';

const CKEditorClassic = ({ name, value, onChange, config = {} }) => {
  const editorRef = useRef(null);

  const defaultConfig = {
    height: '300px',
    toolbar: [
      { name: 'document', items: ['Source', '-', 'Save', 'NewPage', 'ExportPdf', 'Preview', 'Print', '-', 'Templates'] },
      { name: 'clipboard', items: ['Cut', 'Copy', 'Paste', 'PasteText', 'PasteFromWord', '-', 'Undo', 'Redo'] },
      { name: 'editing', items: ['Find', 'Replace', '-', 'SelectAll', '-', 'Scayt'] },
      { name: 'basicstyles', items: ['Bold', 'Italic', 'Underline', 'Strike', 'Subscript', 'Superscript', '-', 'CopyFormatting', 'RemoveFormat'] },
      '/',
      { name: 'paragraph', items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote', 'CreateDiv', '-', 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock', '-', 'BidiLtr', 'BidiRtl'] },
      { name: 'links', items: ['Link', 'Unlink', 'Anchor'] },
      { name: 'insert', items: ['Image', 'Flash', 'Table', 'HorizontalRule', 'Smiley', 'SpecialChar', 'PageBreak', 'Iframe'] },
      '/',
      { name: 'styles', items: ['Styles', 'Format', 'Font', 'FontSize'] },
      { name: 'colors', items: ['TextColor', 'BGColor'] },
      { name: 'tools', items: ['Maximize', 'ShowBlocks'] }
    ],
    removeButtons: '',
    format_tags: 'p;h1;h2;h3;pre',
    removeDialogTabs: 'image:advanced;link:advanced',
    allowedContent: true,
    extraPlugins: 'justify,font,colorbutton,find,image2',
    ...config
  };

  const handleChange = (evt) => {
    const data = evt.editor.getData();
    onChange(name, data);
  };

  const handleInstanceReady = (evt) => {
    editorRef.current = evt.editor;
  };

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.getData()) {
      editorRef.current.setData(value);
    }
  }, [value]);

  return (
    <div className="ckeditor-container">
      <CKEditor
        initData={value}
        config={defaultConfig}
        onChange={handleChange}
        onInstanceReady={handleInstanceReady}
      />
    </div>
  );
};

CKEditorClassic.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  config: PropTypes.object
};

export default CKEditorClassic;