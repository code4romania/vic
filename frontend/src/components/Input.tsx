import React, { ComponentPropsWithoutRef, ReactNode } from 'react';

interface InputProps extends ComponentPropsWithoutRef<'input'> {
  label: string;
  helper?: ReactNode;
}

const Input = ({ label, helper, ...props }: InputProps) => {
  return (
    <div className="flex gap-1 flex-col">
      <label htmlFor={label}>{label}</label>
      <input id={label} {...props} />
      {helper}
    </div>
  );
};

export default Input;
