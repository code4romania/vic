import React from 'react';

interface FormReadOnlyElementProps {
  label: string;
  value: string | number | readonly string[];
}

const FormReadOnlyElement = ({ label, value }: FormReadOnlyElementProps) => {
  return (
    <div className="flex gap-2.5 flex-col">
      <label>{label}</label>
      <p>{value}</p>
    </div>
  );
};

export default FormReadOnlyElement;
