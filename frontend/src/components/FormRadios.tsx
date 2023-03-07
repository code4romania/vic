import React from 'react';
import { classNames } from '../common/utils/utils';
import InputsRadio, { InputsRadioProps } from './InputsRadio';

interface FormRadiosProps extends InputsRadioProps {
  errorMessage?: string;
}

const FormRadios = ({
  errorMessage,
  readOnly,
  label,
  options,
  className,
  helper,
  ...props
}: FormRadiosProps) => {
  return readOnly ? (
    <div>Read only to be added in edit</div>
  ) : (
    <InputsRadio
      options={options}
      label={label}
      className={classNames(
        errorMessage
          ? 'border border-red-500 text-red-900 focus:ring-red-500 focus:border-red-500'
          : '',
        className || '',
      )}
      {...props}
      helper={errorMessage ? <p className="text-red-500">{errorMessage}</p> : helper}
    />
  );
};

export default FormRadios;
