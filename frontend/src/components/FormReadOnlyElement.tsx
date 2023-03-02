import React from 'react';

interface FormReadOnlyElementProps {
  label: string;
  value?: string | number;
}

const FormReadOnlyElement = ({ label, value }: FormReadOnlyElementProps) => {
  return (
    <div className="flex gap-2.5 flex-col">
      <small className="text-cool-gray-500">{label || ''}</small>
      <p>{value || '-'}</p>
    </div>
  );
};

export default FormReadOnlyElement;
