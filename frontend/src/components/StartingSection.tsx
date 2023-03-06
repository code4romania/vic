import React from 'react';

interface StartingSectionProps {
  title: string;
  subtitle: string;
}

const StartingSection = ({ title, subtitle }: StartingSectionProps) => {
  return (
    <div className="flex gap-2.5 flex-col">
      <h3>{title}</h3>
      <small className="text-cool-gray-500">{subtitle}</small>
    </div>
  );
};

export default StartingSection;
