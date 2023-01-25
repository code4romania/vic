import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
}

const PageLayout = ({ children }: PageLayoutProps) => (
  <div className="flex flex-col gap-6">{children}</div>
);

export default PageLayout;
