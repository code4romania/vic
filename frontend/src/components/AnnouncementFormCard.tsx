import React, { ReactNode } from 'react';
import i18n from '../common/config/i18n';
import Card from '../layouts/CardLayout';
import Button from './Button';

interface AnnouncementFormCardProps {
  title: string;
  subtitle: string;
  submitLabel: string;
  submitIcon?: ReactNode;
  disabled?: boolean;
  submitTitle?: string;
  onCancel: () => void;
  onSubmit: () => void;
  children: ReactNode;
}

// The create/edit form as a centered card, like the design's dialog: title and hint on top,
// the fields, then Cancel and the main action at the bottom.
const AnnouncementFormCard = ({
  title,
  subtitle,
  submitLabel,
  submitIcon,
  disabled,
  submitTitle,
  onCancel,
  onSubmit,
  children,
}: AnnouncementFormCardProps) => (
  <div className="w-full max-w-3xl">
    <Card>
      <div className="px-5 sm:px-8 pt-6 pb-4">
        <h2>{title}</h2>
        <p className="mt-1 text-sm text-cool-gray-500">{subtitle}</p>
      </div>
      <div className="px-5 sm:px-8 py-6">{children}</div>
      <div className="px-5 sm:px-8 py-4 flex flex-wrap justify-end gap-3">
        <Button
          type="button"
          className="btn-outline-secondary"
          label={i18n.t('general:cancel')}
          onClick={onCancel}
        />
        <Button
          type="button"
          className="btn-primary"
          label={submitLabel}
          icon={submitIcon}
          disabled={disabled}
          title={submitTitle}
          onClick={onSubmit}
        />
      </div>
    </Card>
  </div>
);

export default AnnouncementFormCard;
