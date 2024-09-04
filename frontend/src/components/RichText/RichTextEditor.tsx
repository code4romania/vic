import React from 'react';
import { useTranslation } from 'react-i18next';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({
  value,
  onChange,
}: {
  onChange: (value: string) => void;
  value: string;
}) => {
  const { t } = useTranslation('doc_templates');

  return (
    <div className="flex flex-col gap-4">
      <p className="font-robotoBold">{t('text_editor.title')}</p>
      <ReactQuill
        placeholder={t('text_editor.placeholder')}
        theme="snow"
        onChange={onChange}
        value={value}
        // this bottom margin is NECESSARY due to the default styling, which sets the height of 100% to the text editor, but it doesn't take into consideration the toolbar height
        className="mb-10 max-h-[40rem]"
      />
    </div>
  );
};

export default RichTextEditor;
