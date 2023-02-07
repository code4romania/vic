import React from 'react';

interface FormReadOnlyElementProps {
  label: string;
  value?: string | number;
  labelStyle?: string;
  valueStyle?: string;
}

const FormReadOnlyElement = ({
  label,
  value,
  labelStyle,
  valueStyle,
}: FormReadOnlyElementProps) => {
  return (
    <div className="flex gap-2.5 flex-col">
      <label className={labelStyle}>{label}</label>
      <p className={valueStyle}>{value}</p>
    </div>
  );
};

export default FormReadOnlyElement;
