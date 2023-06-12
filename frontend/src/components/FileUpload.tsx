import React, { useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { classNames } from '../common/utils/utils';
import { useTranslation } from 'react-i18next';

interface FileUploadProps {
  onChange: (file: File) => void;
  errorMessage?: string;
  label: string;
}

const FileUpload = ({ onChange, errorMessage, label }: FileUploadProps) => {
  const { t } = useTranslation('general');

  const { acceptedFiles, getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  });

  // send file back to controller
  useEffect(() => {
    if (acceptedFiles.length > 0) onChange(acceptedFiles[0]);
  }, [acceptedFiles]);

  return (
    <div className="flex flex-col items-start gap-1">
      {label && <label>{label}</label>}
      <div
        className={classNames(
          'min-h-[10rem] w-full max-w-[37rem] bg-gray-50 border-dashed border-2  rounded-lg flex flex-col justify-center items-center',
          errorMessage ? 'border-red-500' : 'border-gray-200',
        )}
      >
        <div {...getRootProps({ className: 'dropzone' })}>
          <input {...getInputProps()} />
          <p className={classNames(errorMessage ? 'text-red-500' : 'text-gray-400')}>
            {acceptedFiles.length > 0 ? acceptedFiles[0].name : t('add_file')}
          </p>
        </div>
      </div>
      <p className="text-red-500">{errorMessage}</p>
    </div>
  );
};

export default FileUpload;
