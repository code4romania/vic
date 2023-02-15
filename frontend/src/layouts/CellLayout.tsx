import React from 'react';

interface CellLayoutProps {
  children: React.ReactNode;
}

// All cells from table as selectors have this div parent
const CellLayout = ({ children }: CellLayoutProps) => (
  <div data-tag="allowRowEvents">{children}</div>
);

export default CellLayout;
