import React from 'react';
import { FieldError, FieldErrorsImpl, Merge } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const RichTextEditor = ({
  value,
  onChange,
  error,
  className,
}: {
  onChange: (value: string) => void;
  value: string;
  error?: FieldError | Merge<FieldError, FieldErrorsImpl> | undefined;
  className?: string;
}) => {
  const { t } = useTranslation('doc_templates');
  console.log('error', error);

  return (
    <div className="flex flex-col gap-4">
      <p className="font-robotoBold">{t('text_editor.title')}</p>
      {error && <p className="text-red-500">{error.message?.toString()}</p>}
      <ReactQuill
        placeholder={t('text_editor.placeholder')}
        theme="snow"
        onChange={onChange}
        value={value}
        // this bottom margin is NECESSARY due to the default styling, which sets the height of 100% to the text editor, but it doesn't take into consideration the toolbar height
        className={`mb-10 border-2 border-cool-gray-900 rounded min-h-[10rem] max-h-[40rem] ${error && 'border-2 border-red-500'} ${className}`}
      />
    </div>
  );
};

export default RichTextEditor;
