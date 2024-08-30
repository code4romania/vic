import React, { useState } from 'react';
import { Controller, FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import Button from '../Button';
import { ContractTermsEmptyState } from './ContractTermsEmptyState';
import { useTranslation } from 'react-i18next';
import RichTextEditor from '../RichText/RichTextEditor';
import { ContractTermsContent } from './ContractTermsContent';

export const ContractTerms = () => {
  const { control, handleSubmit, reset } = useForm();
  const { t } = useTranslation('doc_templates');
  const [editingText, setEditingText] = useState(false);

  // todo: initial value for contractTerms taken from the template
  const [contractTerms, setContractTerms] = useState<string>('');

  const onSubmit: SubmitHandler<FieldValues> = ({ contractTerms }) => {
    // save the new value
    setContractTerms(contractTerms);
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
          // ? todo:do we need to set any validation rules here?
          // rules={}
          control={control}
          render={({
            field: { value, onChange },
          }: {
            field: { value: string; onChange: (value: string) => void };
          }) => {
            return <RichTextEditor value={value} onChange={onChange} />;
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
            onClick={handleSubmit(onSubmit)}
          />
        </div>
      </div>
    );
  }

  if (!contractTerms) {
    return <ContractTermsEmptyState setEditingText={setEditingText} />;
  }
  // normal text
  return <ContractTermsContent innerContent={contractTerms} setEditingText={setEditingText} />;
};
