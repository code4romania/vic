import React, { useEffect } from 'react';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import FormInput from './FormInput';
import FormDatePicker from './FormDatePicker';
import DateRangePicker from './DateRangePicker';
import { useTranslation } from 'react-i18next';
import Button from './Button';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import i18n from '../common/config/i18n';

interface AutoFillContractCardProps {
  onSubmit: ({ startingNumber, contractDate, contractPeriod }: FieldValues) => void;
}

const autoFillValidationSchema = yup.object({
  startingNumber: yup
    .number()
    .positive(`${i18n.t('doc_templates:contract_card_form.document_number.invalid')}`)
    .typeError(`${i18n.t('doc_templates:contract_card_form.document_number.invalid')}`)
    .required(`${i18n.t('doc_templates:contract_card_form.document_number:required')}`),
  documentContractDate: yup
    .date()
    .required(`${i18n.t('doc_templates:contract_card_form.document_date.required')}`),
  documentContractPeriod: yup
    .array()
    .test(
      'both-dates-required',
      `${i18n.t('doc_templates:contract_card_form.document_period.required')}`,
      (value) => value && value[0] !== null && value[1] !== null,
    )
    .required(`${i18n.t('doc_templates:contract_card_form.document_period.required')}`),
});

export const AutoFillContractCard = ({ onSubmit }: AutoFillContractCardProps) => {
  const { t } = useTranslation(['fast_contract_fill', 'general']);

  const {
    control,
    reset,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(autoFillValidationSchema),
    defaultValues: {
      startingNumber: undefined,
      documentContractDate: undefined,
      documentContractPeriod: [null, null],
    },
  });
  const documentContractDate = watch('documentContractDate');
  useEffect(() => {
    setValue('documentContractPeriod', [null, null]);
  }, [documentContractDate]);

  const handleReset = () => {
    reset();
  };

  return (
    <>
      <div className="bg-white rounded shadow flex flex-col p-4 gap-4">
        <p className="font-robotoBold">{t('title')}</p>
        <p className="text-cool-gray-700">{t('description')}</p>
        <div className="flex flex-col md:flex-row gap-6">
          <Controller
            name="startingNumber"
            control={control}
            render={({ field: { value, onChange } }) => {
              return (
                <FormInput
                  label={t('form.starting_number')}
                  value={value ?? ''}
                  onChange={onChange}
                  placeholder="Introdu numarul"
                  wrapperClassname="flex-1"
                  type="number"
                  errorMessage={errors.startingNumber ? t('required', { ns: 'general' }) : ''}
                />
              );
            }}
          />
          <Controller
            name="documentContractDate"
            control={control}
            render={({ field: { value, onChange } }) => (
              <div className="flex-1 min-w-0">
                <FormDatePicker
                  label={t('form.contract_date')}
                  placeholder="ZZ.LL.AAAA"
                  value={value}
                  onChange={onChange}
                  minDate={new Date()}
                  maxDate={new Date(new Date().setMonth(new Date().getMonth() + 6))}
                  errorMessage={errors.documentContractDate ? t('required', { ns: 'general' }) : ''}
                />
              </div>
            )}
          />

          <Controller
            name="documentContractPeriod"
            control={control}
            render={({ field: { value, onChange } }) => (
              <DateRangePicker
                label={t('form.contract_period')}
                className="flex-1"
                value={value}
                onChange={onChange}
                minDate={documentContractDate}
                errorMessage={errors.documentContractPeriod ? t('required', { ns: 'general' }) : ''}
              />
            )}
          />
        </div>
        <div className="flex flex-row gap-4">
          <Button
            label={t('clear')}
            className="btn-outline-secondary shadow px-16"
            onClick={handleReset}
          />
          <Button
            label={t('apply_all')}
            className="btn-primary text-black"
            onClick={handleSubmit(onSubmit)}
          />
        </div>
      </div>
    </>
  );
};
