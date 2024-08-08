import React, { useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { classNames } from '../common/utils/utils';
import { useTranslation } from 'react-i18next';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';

type FileType = 'doc' | 'image';

interface FileUploadProps {
  onChange: (file: File) => void;
  errorMessage?: string;
  label: string;
  type?: FileType;
}

const FileUpload = ({ onChange, errorMessage, label, type = 'doc' }: FileUploadProps) => {
  const { t } = useTranslation('general');

  const { acceptedFiles, getRootProps, getInputProps, isDragActive } = useDropzone({
    accept:
      type === 'doc'
        ? {
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
          }
        : {
            'image/jpeg': ['.png', '.jpg', '.jpeg'],
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
          errorMessage
            ? 'border-red-500'
            : isDragActive
              ? 'border-yellow-500 bg-yellow-50'
              : 'border-gray-200',
        )}
      >
        <div
          {...getRootProps({ className: 'dropzone' })}
          className={`w-full flex-1 items-center justify-center flex flex-col `}
        >
          <input {...getInputProps()} />

          <div className="flex flex-col items-center justify-center gap-6">
            {/* arrow icon */}
            <div className="w-10 h-10 bg-yellow-500 rounded-[50%] flex justify-center items-center">
              <ArrowUpTrayIcon width={20} height={20} strokeWidth={2} stroke="white" />
            </div>

            <div
              className={`flex flex-row  gap-1 ${
                errorMessage
                  ? 'text-red-500'
                  : acceptedFiles.length > 0
                    ? 'text-yellow-600'
                    : 'text-black'
              }`}
            >
              {acceptedFiles.length > 0 ? (
                <p className="text-center px-8">{acceptedFiles[0].name}</p>
              ) : (
                <>
                  <p>{t('add_file.p1')}</p>
                  <p className="font-semibold underline underline-offset-2 cursor-pointer hover:text-yellow-600">
                    {t('add_file.p2')}
                  </p>
                  <p>{t('add_file.p3')}</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <p className="text-red-500">{errorMessage}</p>
    </div>
  );
};

export default FileUpload;
