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
  helper,
  ...props
}: FormTextareaProps) => {
  return readOnly ? (
    <FormReadOnlyElement
      label={label}
      value={defaultValue instanceof Array ? defaultValue.join(', ') : defaultValue}
    />
  ) : (
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
      helper={errorMessage ? <p className="text-red-500">{errorMessage}</p> : helper}
    />
  );
};

export default FormTextarea;
