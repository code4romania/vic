import React from 'react';
import Input, { InputProps } from './Input';
import { classNames } from '../common/utils/utils';

interface FormInputProps extends InputProps {
  errorMessage?: string;
}

const FormInput = ({
  errorMessage,
  readOnly,
  value,
  label,
  className,
  helper,
  ...props
}: FormInputProps) => {
  return readOnly ? (
    <div className="flex gap-2.5 flex-col">
      <label>{label}</label>
      <p>{value}</p>
    </div>
  ) : (
    <Input
      value={value}
      label={label}
      className={classNames(
        errorMessage
          ? 'border border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500'
          : '',
        className,
      )}
      {...props}
      helper={errorMessage ? <p className="text-red-500">{errorMessage}</p> : helper}
    />
  );
};

export default FormInput;
