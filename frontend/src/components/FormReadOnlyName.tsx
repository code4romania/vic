import React from 'react';

interface FormReadOnlyNameProps {
  label: string;
  value?: string | number;
  onClick?: () => void;
}

const FormReadOnlyName = ({ label, value, onClick }: FormReadOnlyNameProps) => {
  return (
    <div className="flex gap-2.5 flex-col">
      <small className="text-cool-gray-500">{label || ''}</small>
      {onClick ? <a onClick={onClick}>{value || '-'}</a> : <a>{value || '-'}</a>}
    </div>
  );
};

export default FormReadOnlyName;
