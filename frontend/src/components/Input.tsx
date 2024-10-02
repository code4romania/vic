import React, { ComponentPropsWithoutRef, ReactNode } from 'react';

export interface InputProps extends ComponentPropsWithoutRef<'input'> {
  label?: string;
  helper?: ReactNode;
  wrapperClassname?: string;
}

const Input = ({ label, helper, wrapperClassname, ...props }: InputProps) => {
  return (
    <div className={`flex gap-1 flex-col ${wrapperClassname}`}>
      {label && <label htmlFor={`${label}__input`} className="text-ellipsis text-nowrap">{label}</label>}
      <input id={`${label}__input`} {...props} />
      {helper}
    </div>
  );
};

export default Input;
