import React from 'react';
import Button from '../Button';
import { PencilIcon } from '@heroicons/react/24/solid';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';

export const ContractTermsContent = ({
  innerContent,
  setEditingText,
}: {
  innerContent: string;
  setEditingText: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const { t } = useTranslation('doc_templates');

  return (
    <div className="flex flex-col gap-4 my-4 py-8 border-y-2 border-dashed">
      <div className="flex flex-row justify-between items-center">
        <p className="font-robotoBold">{t('contract_terms.title')}</p>
        <Button
          className="btn-outline-secondary text-cool-gray-500"
          label={t('text_editor.title')}
          icon={<PencilIcon className="h-5 w-5 text-cool-gray-500" />}
          onClick={() => setEditingText(true)}
        />
      </div>
      <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(innerContent || '') }} />
    </div>
  );
};
