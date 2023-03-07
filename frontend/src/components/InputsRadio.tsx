import React, { ComponentPropsWithoutRef, ReactNode } from 'react';

export interface InputsRadioProps extends ComponentPropsWithoutRef<'input'> {
  options: { key: string; label: string }[];
  label?: string;
  helper?: ReactNode;
}

const InputsRadio = ({ options, helper, label, defaultValue, ...props }: InputsRadioProps) => {
  return (
    <div className="flex gap-1 flex-col">
      {label && <label>{label}</label>}
      {options.map((radio) => (
        <div key={radio.key} className="flex gap-1 sm:gap-2 items-center">
          <input
            type="radio"
            id={`${radio.label}__input`}
            {...props}
            value={radio.key}
            checked={radio.key === defaultValue}
          />
          <label htmlFor={`${radio.label}__input`}>{radio.label}</label>
        </div>
      ))}
      {helper}
    </div>
  );
};

export default InputsRadio;
