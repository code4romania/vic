import React from 'react';
import TargetsMultiSelect from '../containers/TargetsMultiSelect';
import FormReadOnlyElement from './FormReadOnlyElement';
import { MultiSelectProps } from './MultiSelect';

interface FormSelectProps extends Omit<MultiSelectProps, 'options'> {
  errorMessage?: string;
  readOnly?: boolean;
}

// TODO: this should support also single select
const FormSelect = ({ label, selected, readOnly, ...props }: FormSelectProps) => {
  return readOnly ? (
    <FormReadOnlyElement label={label || ''} value={selected?.length ? selected.join(', ') : '-'} />
  ) : (
    <TargetsMultiSelect {...props} label={label} selected={selected} />
  );
};

export default FormSelect;
