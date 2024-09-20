import React from 'react';
import Input, { InputProps } from './Input';
import { classNames } from '../common/utils/utils';
import FormReadOnlyElement from './FormReadOnlyElement';

interface FormInputProps extends InputProps {
  errorMessage?: string;
  wrapperClassname?: string;
}

const FormInput = ({
  errorMessage,
  readOnly,
  value,
  label,
  className,
  wrapperClassname,
  helper,
  ...props
}: FormInputProps) => {
  return readOnly ? (
    <FormReadOnlyElement
      label={label || ''}
      value={value instanceof Array ? value.join(', ') : value}
    />
  ) : (
    <Input
      value={value}
      label={label}
      className={classNames(
        errorMessage
          ? 'border border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500'
          : '',
        className || '',
      )}
      wrapperClassname={wrapperClassname}
      aria-invalid={errorMessage ? 'true' : 'false'}
      {...props}
      helper={errorMessage ? <p className="text-red-500">{errorMessage}</p> : helper}
    />
  );
};

export default FormInput;
