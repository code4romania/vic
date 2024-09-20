import React, { useState } from 'react';
import {
  Control,
  Controller,
  FieldErrors,
  FieldValues,
  UseFormGetValues,
  UseFormReset,
} from 'react-hook-form';
import Button from '../Button';
import { ContractTermsEmptyState } from './ContractTermsEmptyState';
import { useTranslation } from 'react-i18next';
import RichTextEditor from '../RichText/RichTextEditor';
import { ContractTermsContent } from './ContractTermsContent';

export const ContractTerms = ({
  control,
  reset,
  getValues,
  formErrors,
}: {
  control: Control<FieldValues>;
  reset: UseFormReset<FieldValues>;
  getValues: UseFormGetValues<FieldValues>;
  formErrors: FieldErrors<FieldValues>;
}) => {
  const { t } = useTranslation(['doc_templates', 'general']);
  const [editingText, setEditingText] = useState(false);

  // todo: initial value for contractTerms taken from the template
  const [contractTerms, setContractTerms] = useState<string>('');

  const onSave = () => {
    const newContractTerms = getValues('contractTerms');
    // save the new value
    setContractTerms(newContractTerms);
    // close text editor
    setEditingText(false);
  };

  // TEXT EDITOR SECTION
  if (editingText) {
    return (
      <div className="flex flex-col gap-4 my-8">
        <Controller
          key="contractTermsController"
          name="contractTerms"
          control={control}
          rules={{ required: { value: true, message: t('required', { ns: 'general' }) } }}
          render={({
            field: { value, onChange },
          }: {
            field: { value: string; onChange: (value: string) => void };
          }) => {
            return (
              <RichTextEditor value={value} onChange={onChange} error={formErrors.contractTerms} />
            );
          }}
        />
        <div className="flex flex-row justify-end gap-2">
          <Button
            label={t('contract_terms.cancel')}
            className="btn-outline-secondary text-cool-gray-600"
            onClick={() => {
              // reset the internal value of the RichTextEditor to that before modifications
              reset({ contractTerms });
              // close editor
              setEditingText(false);
            }}
          />
          <Button
            label={t('contract_terms.save')}
            className="btn-primary text-cool-gray-600"
            onClick={onSave}
          />
        </div>
      </div>
    );
  }

  if (!contractTerms) {
    return (
      <ContractTermsEmptyState setEditingText={setEditingText} error={formErrors.contractTerms} />
    );
  } // normal text
  return <ContractTermsContent innerContent={contractTerms} setEditingText={setEditingText} />;
};
