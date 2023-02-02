import React from 'react';
import Textarea, { TextareaProps } from './Textarea';
import { classNames } from '../common/utils/utils';
import FormReadOnlyElement from './FormReadOnlyElement';

interface FormTextareaProps extends TextareaProps {
  errorMessage?: string;
}

const FormTextarea = ({
  errorMessage,
  readOnly,
  defaultValue,
  label,
  className,
  ...props
}: FormTextareaProps) => {
  return readOnly ? (
    <FormReadOnlyElement label={label} value={defaultValue || ''} />
  ) : (
    <div className="flex flex-col gap-1">
      <Textarea
        label={label}
        className={classNames(
          errorMessage
            ? 'border border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500'
            : '',
          className,
        )}
        defaultValue={defaultValue}
        {...props}
      />
      {errorMessage && <p className="text-red-500">{errorMessage}</p>}
    </div>
  );
};

export default FormTextarea;
