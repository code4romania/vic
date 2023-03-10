import React from 'react';
import { classNames } from '../common/utils/utils';
import FormReadOnlyElement from './FormReadOnlyElement';
import RadioGroup, { RadioGroupProps } from './RadioGroup';

interface FormRadiosProps extends RadioGroupProps {
  errorMessage?: string;
}

const FormRadioGroup = ({
  errorMessage,
  readOnly,
  label,
  value,
  options,
  className,
  helper,
  ...props
}: FormRadiosProps) => {
  return readOnly ? (
    <FormReadOnlyElement
      label={label || ''}
      value={value instanceof Array ? value.join(', ') : value}
    />
  ) : (
    <RadioGroup
      {...props}
      options={options}
      label={label}
      value={value}
      className={classNames(
        errorMessage
          ? 'border border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500'
          : '',
        className || '',
      )}
      helper={errorMessage ? <p className="text-red-500">{errorMessage}</p> : helper}
    />
  );
};

export default FormRadioGroup;
