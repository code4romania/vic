import React from 'react';
import { useNavigate } from 'react-router';

interface ILinkTextProps {
  url: string;
  content: React.ReactNode;
  title?: string;
}

export const LinkText = ({ url, title, content }: ILinkTextProps) => {
  const navigate = useNavigate();

  const onLinkClick = () => {
    navigate(url, { replace: true });
  };

  return (
    <span
      onClick={onLinkClick}
      title={title || ''}
      className="text-turquoise hover:text-turquoise-700 active:text-turquoise-800 cursor-pointer text-xs sm:text-sm font-normal"
    >
      {content}
    </span>
  );
};
