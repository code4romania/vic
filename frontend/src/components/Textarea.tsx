import React, { ComponentPropsWithoutRef } from 'react';

export interface TextareaProps extends ComponentPropsWithoutRef<'textarea'> {
  label: string;
}

const Textarea = ({ label, ...props }: TextareaProps) => {
  return (
    <div className="flex gap-1 flex-col">
      <label htmlFor={label}>{label}</label>
      <textarea id={label} {...props}></textarea>
    </div>
  );
};

export default Textarea;
