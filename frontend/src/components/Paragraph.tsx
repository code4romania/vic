import React from 'react';

interface ParagraphProps {
  title: string;
  children: string;
}

const Paragraph = ({ title, children }: ParagraphProps) => (
  <div className="flex flex-col gap-2">
    <h2>{title}</h2>
    <p className="text-cool-gray-500">{children}</p>
  </div>
);

export default Paragraph;
