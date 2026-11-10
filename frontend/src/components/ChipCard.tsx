import React, { ReactNode, useState } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Card from '../layouts/CardLayout';
import CardBody from './CardBody';
import CardHeader from './CardHeader';

export interface ChipItem {
  id: string;
  name: string;
  // a short note next to the name, e.g. how many volunteers it has
  meta?: string;
}

interface ChipCardProps {
  title: string;
  subtitle: string;
  icon: ReactNode;
  items: ChipItem[];
  addPlaceholder: string;
  addLabel: string;
  emptyText: string;
  editLabel: (item: ChipItem) => string;
  removeLabel: (item: ChipItem) => string;
  // returns an error message when the name is not accepted
  validate: (name: string) => string | undefined;
  onAdd: (name: string) => Promise<boolean>;
  onEdit: (item: ChipItem) => void;
  onRemove: (item: ChipItem) => void;
  footer?: ReactNode;
}

// A list of names shown as chips: click one to edit it, × to remove it, and a field to add one.
// Used for departments, roles, branches and activity types on "Configurare organizație".
const ChipCard = ({
  title,
  subtitle,
  icon,
  items,
  addPlaceholder,
  addLabel,
  emptyText,
  editLabel,
  removeLabel,
  validate,
  onAdd,
  onEdit,
  onRemove,
  footer,
}: ChipCardProps) => {
  const [name, setName] = useState('');
  const [error, setError] = useState<string>();
  const [isAdding, setIsAdding] = useState(false);

  const add = async () => {
    const message = validate(name.trim());
    setError(message);
    if (message) return;
    setIsAdding(true);
    const added = await onAdd(name.trim());
    setIsAdding(false);
    if (added) setName('');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-navy">{icon}</span>
          <div>
            <h2>{title}</h2>
            <p className="text-sm text-cool-gray-500">{subtitle}</p>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        <div className="flex flex-col gap-4">
          {items.length ? (
            <ul className="flex flex-wrap gap-2" aria-label={title}>
              {items.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center rounded-lg border border-cool-gray-300 bg-white text-sm text-cool-gray-900"
                >
                  <button
                    type="button"
                    aria-label={editLabel(item)}
                    title={editLabel(item)}
                    className="pl-3 pr-1.5 py-1.5 rounded-l-lg hover:bg-navy-50 font-robotoMedium"
                    onClick={() => onEdit(item)}
                  >
                    {item.name}
                    {item.meta && (
                      <span className="ml-1.5 text-xs font-roboto text-cool-gray-500">
                        {item.meta}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    aria-label={removeLabel(item)}
                    title={removeLabel(item)}
                    className="px-1.5 py-1.5 rounded-r-lg text-cool-gray-500 hover:bg-cool-gray-100 hover:text-figure-red"
                    onClick={() => onRemove(item)}
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-cool-gray-500">{emptyText}</p>
          )}
          <div className="flex flex-col gap-1">
            <div className="flex gap-2">
              <input
                type="text"
                aria-label={addPlaceholder}
                placeholder={addPlaceholder}
                className="flex-1 max-w-none"
                value={name}
                aria-invalid={error ? 'true' : 'false'}
                onChange={(event) => {
                  setName(event.target.value);
                  setError(undefined);
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    add();
                  }
                }}
              />
              <button
                type="button"
                className="btn-secondary"
                disabled={!name.trim() || isAdding}
                onClick={add}
              >
                <PlusIcon className="w-4 h-4" aria-hidden="true" />
                {addLabel}
              </button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
          {footer}
        </div>
      </CardBody>
    </Card>
  );
};

export default ChipCard;
