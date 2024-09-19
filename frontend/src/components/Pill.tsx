import React from 'react';

export const Pill = ({
  theme = 'warning',
  label,
}: {
  label: string;
  theme?: 'warning' | 'success' | 'danger';
}) => {
  const mapThemeToPillColor = () => {
    switch (theme) {
      case 'danger':
        return {
          backgroundColor: 'bg-red-100',
          bulletColor: 'bg-red-600',
          textColor: 'text-red-600',
        };
      case 'warning':
        return {
          backgroundColor: 'bg-orange-100',
          bulletColor: 'bg-yellow-800',
          textColor: 'text-yellow-800',
        };
      case 'success':
        return {
          backgroundColor: 'bg-lime-100',
          bulletColor: 'bg-lime-600',
          textColor: 'text-lime-600',
        };
    }
  };

  const color = mapThemeToPillColor();

  return (
    <div
      className={`py-1 px-2 pr-3 ${color.backgroundColor} rounded-2xl flex flex-row gap-2 items-center`}
    >
      <span className={`h-2 w-2 border-solid rounded-full self-center ${color.bulletColor}`} />
      <p className={`text-xs ${color.textColor}`}>{label}</p>
    </div>
  );
};
