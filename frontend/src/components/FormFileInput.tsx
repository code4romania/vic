import React, { ComponentPropsWithoutRef, ReactNode } from 'react';

export interface FormFileInputProps extends ComponentPropsWithoutRef<'input'> {
  label?: string;
  buttonLabel: string;
  helper?: ReactNode;
  errorMessage?: string;
}

const FormFileInput = ({
  label,
  helper,
  buttonLabel,
  errorMessage,
  ...props
}: FormFileInputProps) => {
  return (
    <div className="flex gap-1 flex-col">
      {label && <label htmlFor={`${buttonLabel}__input`}>{label}</label>}
      <label htmlFor={`${buttonLabel}__input`} className={props.className}>
        {buttonLabel}
      </label>
      <input {...props} type="file" className="hidden" id={`${buttonLabel}__input`} />
      {errorMessage ? <p className="text-red-500">{errorMessage}</p> : helper}
    </div>
  );
};

export default FormFileInput;
