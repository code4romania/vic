import React from 'react';

interface FormReadOnlyElementProps {
  label: string;
  value?: string | number;
  onClick?: () => void;
}

const FormReadOnlyElement = ({ label, value, onClick }: FormReadOnlyElementProps) => {
  return (
    <div className="flex gap-2.5 flex-col">
      <small className="text-cool-gray-500">{label || ''}</small>
      {!onClick && <p>{value || '-'}</p>}
      {onClick ? <a onClick={onClick}>{value || '-'}</a> : <a>{value || '-'}</a>}
    </div>
  );
};

export default FormReadOnlyElement;
