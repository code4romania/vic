import React, { ComponentPropsWithoutRef, ReactNode } from 'react';

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  label: string;
  icon?: ReactNode;
}

const Button = ({ label, icon, ...rest }: ButtonProps) => {
  return (
    <button {...rest} aria-label={label}>
      {icon}
      {label}
    </button>
  );
};

export default Button;
