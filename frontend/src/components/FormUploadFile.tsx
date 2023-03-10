import React from 'react';
import { InputProps } from './Input';
import { classNames } from '../common/utils/utils';
import i18n from '../common/config/i18n';
import { CalendarIcon, PhotoIcon } from '@heroicons/react/24/outline';

interface FormUploadFileProps extends InputProps {
  errorMessage?: string;
}

const FormUploadFile = ({
  errorMessage,
  label,
  value,
  onChange,
  className,
  helper,
}: FormUploadFileProps) => {
  return (
    <div className="flex gap-5 items-center flex-wrap">
      <div className="w-20 h-20 rounded-full bg-cool-gray-100 grid place-items-center shrink-0">
        {value ? (
          <PhotoIcon className="h-12 w-12 text-gray-500" />
        ) : (
          <CalendarIcon className="h-12 w-12 text-gray-500" />
        )}
      </div>
      <label
        htmlFor={`${label}__input`}
        className={classNames(
          errorMessage
            ? 'border border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500'
            : '',
          className || '',
          'btn-outline-secondary max-w-fit',
        )}
      >
        {i18n.t('events:form.logo.button_label')}
      </label>
      <input
        type="file"
        accept="image/png, image/jpeg"
        id={`${label}__input`}
        value={value}
        onChange={onChange}
        className="hidden"
      />
      {errorMessage ? <p className="text-red-500">{errorMessage}</p> : helper}
    </div>
  );
};

export default FormUploadFile;
