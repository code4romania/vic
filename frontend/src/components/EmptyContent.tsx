import React, { ReactNode } from 'react';
import { ExclamationTriangleIcon, InboxIcon } from '@heroicons/react/24/outline';
import i18n from '../common/config/i18n';

interface EmptyContentProps {
  description: string;
  // Optional bold line above the description; by default none for lists, "Eroare" for load errors
  title?: string;
  icon?: ReactNode;
  // A button or link under the text (e.g. "Adaugă voluntar")
  action?: ReactNode;
}

// Nothing to show: a gray icon in a circle, an optional title, a short text. The pages pass the
// generic "error loading" text for failed requests: those get a warning icon and a title.
const EmptyContent = ({ description, title, icon, action }: EmptyContentProps) => {
  const isError = description === i18n.t('general:error.load_entries');
  const heading = title ?? (isError ? i18n.t('states:error_title') : undefined);

  return (
    <div
      role="row"
      className="w-full flex flex-col items-center justify-center gap-3 px-4 py-12 text-center"
    >
      <span
        className={`w-12 h-12 rounded-full flex items-center justify-center ${
          isError ? 'bg-figure-red text-white' : 'bg-cool-gray-100 text-cool-gray-500'
        }`}
        aria-hidden="true"
      >
        {icon ??
          (isError ? (
            <ExclamationTriangleIcon className="w-6 h-6" />
          ) : (
            <InboxIcon className="w-6 h-6" />
          ))}
      </span>
      {heading && <p className="font-robotoMedium text-cool-gray-900">{heading}</p>}
      <p className="max-w-sm text-sm text-cool-gray-500">{description}</p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};

export default EmptyContent;
