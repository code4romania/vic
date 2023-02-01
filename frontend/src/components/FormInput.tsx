import React from 'react';
import Input, { InputProps } from './Input';

interface FormInputProps extends InputProps {
  errorMessage?: string;
}

const FormInput = ({ errorMessage, ...props }: FormInputProps) => {
  return props.readOnly ? (
    <Input
      {...props}
      className="border-0 cursor-default focus:ring-0 shadow-none p-0 text-base"
      helper={''}
    />
  ) : errorMessage ? (
    <Input
      className="border border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500"
      {...props}
      helper={<p className="text-red-500">{errorMessage}</p>}
    />
  ) : (
    <Input {...props} />
  );
};

export default FormInput;
