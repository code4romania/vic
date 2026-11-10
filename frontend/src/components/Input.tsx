import React, { ComponentPropsWithoutRef, ReactNode } from 'react';

export interface InputProps extends ComponentPropsWithoutRef<'input'> {
  label?: string;
  helper?: ReactNode;
}

const Input = ({ label, helper, id, ...props }: InputProps) => {
  // the label must point at the input, also when the caller passes its own id
  const inputId = id ?? (label ? `${label}__input` : undefined);
  return (
    <div className="flex gap-1 flex-col">
      {label && <label htmlFor={inputId}>{label}</label>}
      <input id={inputId} {...props} />
      {helper}
    </div>
  );
};

export default Input;
