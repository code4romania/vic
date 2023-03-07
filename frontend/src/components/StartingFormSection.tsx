import React from 'react';

interface StartingFormSectionProps {
  title: string;
  description: string;
}

const StartingFormSection = ({ title, description }: StartingFormSectionProps) => {
  return (
    <div className="flex gap-2.5 flex-col">
      <h3>{title}</h3>
      <small className="text-cool-gray-500">{description}</small>
    </div>
  );
};

export default StartingFormSection;
