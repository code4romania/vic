import React from 'react';
import CellLayout from '../layouts/CellLayout';
import { useNavigate } from 'react-router';

interface LinkCellProps {
  href: string;
  children?: React.ReactNode;
}

const LinkCell = ({ href, children }: LinkCellProps) => {
  const navigate = useNavigate();

  const onLinkClick = () => {
    navigate(href);
  };

  return (
    <CellLayout>
      <a onClick={onLinkClick}>{children}</a>
    </CellLayout>
  );
};

export default LinkCell;
