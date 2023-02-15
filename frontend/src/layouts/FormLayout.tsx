import React, { ReactNode } from 'react';

interface FormLayoutProps {
  children: ReactNode;
}

const FormLayout = ({ children }: FormLayoutProps) => (
  <div className="flex flex-col gap-6 w-full lg:w-[80%] mx-auto sm:py-12 py-4">{children}</div>
);

export default FormLayout;
