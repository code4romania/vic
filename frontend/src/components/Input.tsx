import React, { ComponentPropsWithoutRef, ReactNode } from 'react';

export interface InputProps extends ComponentPropsWithoutRef<'input'> {
  label: string;
  helper?: ReactNode;
}

const Input = ({ label, helper, ...props }: InputProps) => {
  return (
    <div className="flex gap-1 flex-col">
      <label htmlFor={`${label}__input`}>{label}</label>
      <input id={`${label}__input`} {...props} />
      {helper}
    </div>
  );
};

export default Input;
