import React from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import Button from './Button';

interface PageHeaderAddProps {
  children: string;
  onAddButtonPress: () => void;
  label: string;
}

const PageHeaderAdd = ({ children, onAddButtonPress, label }: PageHeaderAddProps) => (
  <div className="flex justify-between items-center">
    <h1>{children}</h1>

    <Button
      label={label}
      className="btn-primary"
      icon={<PlusIcon className="h-5 w-5" />}
      onClick={onAddButtonPress}
      type="button"
    />
  </div>
);

export default PageHeaderAdd;
