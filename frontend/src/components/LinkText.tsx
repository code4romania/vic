import React from 'react';

interface ILinkTextProps {
  url: string;
  content: React.ReactNode;
}

export const LinkText = ({ url, content }: ILinkTextProps) => (
  <a href={url} target="_blank" className="text-xs sm:text-sm" rel="noreferrer">
    {content}
  </a>
);
