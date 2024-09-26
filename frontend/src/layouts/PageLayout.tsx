import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const PageLayout = ({ children, className }: PageLayoutProps) => (
  <div className={`flex flex-col gap-6 ${className}`}>{children}</div>
);

export default PageLayout;
