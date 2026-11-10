import React, { ComponentPropsWithoutRef, ReactNode } from 'react';

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  label: string;
  icon?: ReactNode;
}

// The label is always visible, also on phones (an icon alone does not say what the button does).
const Button = ({ label, icon, ...rest }: ButtonProps) => {
  return (
    // a passed aria-label wins (e.g. "Suspendă <organizație>" on a table row)
    <button aria-label={label} {...rest}>
      {icon}
      <span>{label}</span>
    </button>
  );
};

export default Button;
