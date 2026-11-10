import React, { ComponentPropsWithoutRef, ReactNode } from 'react';
import { classNames } from '../common/utils/utils';

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  label: string;
  icon?: ReactNode;
}

const Button = ({ label, icon, ...rest }: ButtonProps) => {
  return (
    // a passed aria-label wins (e.g. "Suspendă <organizație>" on a table row)
    <button aria-label={label} {...rest}>
      {icon}
      <span className={classNames(icon ? 'hidden md:block' : '')}>{label}</span>
    </button>
  );
};

export default Button;
