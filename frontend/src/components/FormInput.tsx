import React from 'react';
import Input, { InputProps } from './Input';

interface FormInputProps extends InputProps {
  errorMessage?: string;
}

const FormInput = ({ errorMessage, readOnly, value, label, ...props }: FormInputProps) => {
  return readOnly ? (
    <div className="flex gap-2.5 flex-col">
      <label>{label}</label>
      <p>{value}</p>
    </div>
  ) : errorMessage ? (
    <Input
      value={value}
      label={label}
      className="border border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500"
      {...props}
      helper={<p className="text-red-500">{errorMessage}</p>}
    />
  ) : (
    <Input value={value} label={label} {...props} />
  );
};

export default FormInput;
