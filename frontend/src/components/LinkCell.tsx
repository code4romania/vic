import React from 'react';
import CellLayout from '../layouts/CellLayout';
import { useNavigate } from 'react-router-dom';

interface LinkCellProps {
  href: string;
  children?: React.ReactNode;
}

// A navy link in a table cell: a real href (Tab reaches it, "open in a new tab" works), while a
// plain click stays in the app.
const LinkCell = ({ href, children }: LinkCellProps) => {
  const navigate = useNavigate();

  const onLinkClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0)
      return;
    event.preventDefault();
    navigate(href);
  };

  return (
    <CellLayout>
      <a href={href} onClick={onLinkClick} className="text-xs sm:text-sm line-clamp-2">
        {children}
      </a>
    </CellLayout>
  );
};

export default LinkCell;
