import React, { ComponentPropsWithoutRef, ReactNode } from 'react';

export interface TextareaProps extends ComponentPropsWithoutRef<'textarea'> {
  label: string;
  helper?: ReactNode;
}

const Textarea = ({ label, helper, id, ...props }: TextareaProps) => {
  const textareaId = id ?? label;
  return (
    <div className="flex gap-1 flex-col">
      <label htmlFor={textareaId}>{label}</label>
      <textarea id={textareaId} {...props}></textarea>
      {helper}
    </div>
  );
};

export default Textarea;
