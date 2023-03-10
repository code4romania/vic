import React from 'react';
import TargetsMultiSelect from '../containers/TargetsMultiSelect';
import FormReadOnlyElement from './FormReadOnlyElement';
import { MultiSelectProps } from './MultiSelect';

interface FormSelectProps extends Omit<MultiSelectProps, 'options'> {
  errorMessage?: string;
  readOnly?: boolean;
}

// TODO: this should support also single select
const FormSelect = ({
  errorMessage,
  helper,
  label,
  selected,
  readOnly,
  ...props
}: FormSelectProps) => {
  return readOnly ? (
    <FormReadOnlyElement label={label || ''} value={selected?.length ? selected.join(', ') : '-'} />
  ) : (
    <TargetsMultiSelect
      label={label}
      selected={selected}
      {...props}
      helper={errorMessage ? <p className="text-red-500">{errorMessage}</p> : helper}
    />
  );
};

export default FormSelect;
