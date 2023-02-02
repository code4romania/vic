import React, { ComponentPropsWithoutRef } from 'react';

interface TextareaProps extends ComponentPropsWithoutRef<'textarea'> {
  label: string;
}

const Textarea = ({ label, ...props }: TextareaProps) => {
  return (
    <div className="flex gap-1 flex-col">
      <label htmlFor={label}>{label}</label>
      <textarea id={label} {...props} className="max-w-full"></textarea>
    </div>
  );
};

export default Textarea;
