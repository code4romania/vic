import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import Button from './Button';
import { useTranslation } from 'react-i18next';

export const OrganizationDataError = ({
  onRetry,
  isFetching,
}: {
  onRetry: () => void;
  isFetching: boolean;
}) => {
  const { t } = useTranslation(['doc_templates', 'general']);

  return (
    <div className="border-2 border-red rounded bg-white flex flex-col items-center gap-4 py-4 px-6">
      <ExclamationCircleIcon width={36} height={36} color="red" />
      <p className="text-center text-sm">
        {t('organization.organization_data_form.loading_error')}
      </p>
      <Button
        label={
          isFetching
            ? t('loading', { ns: 'general' })
            : t('organization.organization_data_form.retry_button')
        }
        className="btn-primary bg-red text-white hover:bg-red-800"
        onClick={onRetry}
        disabled={isFetching}
      />
    </div>
  );
};
