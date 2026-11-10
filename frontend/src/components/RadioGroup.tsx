import React, { ComponentPropsWithoutRef, ReactNode } from 'react';
import { SelectItem } from './Select';

export interface RadioGroupProps extends ComponentPropsWithoutRef<'input'> {
  options: SelectItem<string>[];
  label?: string;
  helper?: ReactNode;
}

const RadioGroup = ({ options, helper, label, defaultValue, ...props }: RadioGroupProps) => {
  // the title names the group of radios (a <label> must point at one field)
  const groupLabelId = label ? `${props.name ?? label}__radiogroup` : undefined;
  return (
    <div className="flex gap-1 flex-col" role="radiogroup" aria-labelledby={groupLabelId}>
      {label && <span id={groupLabelId}>{label}</span>}
      {options.map((radio) => (
        <div key={radio.key} className="flex gap-1 sm:gap-2 items-center">
          <input
            {...props}
            type="radio"
            id={`${radio.value}__input`}
            value={radio.key}
            checked={radio.key === defaultValue}
          />
          <label htmlFor={`${radio.value}__input`}>{radio.value}</label>
        </div>
      ))}
      {helper}
    </div>
  );
};

export default RadioGroup;
