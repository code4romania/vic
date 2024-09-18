import React from 'react';
import Button from '../Button';
import { PencilIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import { FieldError, FieldErrorsImpl, Merge } from 'react-hook-form';

export const ContractTermsEmptyState = ({
  setEditingText,
  error,
}: {
  setEditingText: React.Dispatch<React.SetStateAction<boolean>>;
  error: FieldError | Merge<FieldError, FieldErrorsImpl> | undefined;
}) => {
  const { t } = useTranslation('doc_templates');

  return (
    <div
      className={`my-4 py-8 ${error ? 'border-2 border-solid rounded border-red-500 px-8' : 'border-y-2 border-dashed'}`}
    >
      <p className="font-robotoBold">{t('contract_terms.title')}</p>
      {error && <p className="text-red-500">{error.message?.toString()}</p>}

      <div className="flex flex-col justify-center items-center my-10 gap-4 px-24">
        <p className="text-cool-gray-400 text-center">{t('contract_terms.describe')}</p>
        <Button
          label={t('contract_terms.add_text')}
          className="btn-outline-secondary text-cool-gray-500"
          icon={<PencilIcon className="h-5 w-5 text-cool-gray-500" />}
          onClick={() => setEditingText(true)}
        />
        <p className="text-cool-gray-400 text-center">
          {t('contract_terms.first_contract')} {/* //todo: href */}
          <a className="font-roboto text-yellow-600 hover:text-yellow-600 hover:underline underline-offset-2">
            {t('contract_terms.volunteering_contract')}
          </a>
        </p>
      </div>
    </div>
  );
};
