import React, { ComponentPropsWithoutRef, ReactNode } from 'react';
import { classNames } from '../common/utils/utils';

interface ButtonProps extends ComponentPropsWithoutRef<'button'> {
  label: string;
  icon?: ReactNode;
}

const Button = ({ label, icon, ...rest }: ButtonProps) => {
  return (
    <button {...rest} aria-label={label}>
      {icon}
      <div className={classNames(icon ? 'hidden sm:block' : '')}>{label}</div>
    </button>
  );
};

export default Button;
