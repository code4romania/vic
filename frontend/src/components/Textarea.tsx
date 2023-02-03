import React, { ComponentPropsWithoutRef, ReactNode } from 'react';

export interface TextareaProps extends ComponentPropsWithoutRef<'textarea'> {
  label: string;
  helper?: ReactNode;
}

const Textarea = ({ label, helper, ...props }: TextareaProps) => {
  return (
    <div className="flex gap-1 flex-col">
      <label htmlFor={label}>{label}</label>
      <textarea id={label} {...props}></textarea>
      {helper}
    </div>
  );
};

export default Textarea;
