import React, { ReactNode } from 'react';

interface FormLayoutProps {
  children: ReactNode;
}

const FormLayout = ({ children }: FormLayoutProps) => (
  <div className="flex flex-col gap-6 w-full max-w-3xl py-2 sm:py-4">{children}</div>
);

export default FormLayout;
