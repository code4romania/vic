import React from 'react';
import { Control, Controller, FieldValues, UseFormHandleSubmit } from 'react-hook-form';
import FormInput from './FormInput';
import FormDatePicker from './FormDatePicker';
import DateRangePicker from './DateRangePicker';
import { useTranslation } from 'react-i18next';
import Button from './Button';

interface AutoFillContractCardProps {
  control: Control<FieldValues>;
  handleReset: () => void;
  handleSubmit: UseFormHandleSubmit<FieldValues, undefined>;
  onSubmit: ({ startingNumber, contractDate, contractPeriod }: FieldValues) => void;
}

export const AutoFillContractCard = ({
  control,
  handleReset,
  handleSubmit,
  onSubmit,
}: AutoFillContractCardProps) => {
  const { t } = useTranslation('fast_contract_fill');

  return (
    <>
      <div className="bg-white rounded shadow flex flex-col p-4 gap-4">
        <p className="font-robotoBold">{t('title')}</p>
        <p className="text-cool-gray-700">{t('description')}</p>
        <div className="flex flex-col md:flex-row gap-6">
          <Controller
            name="startingNumber"
            control={control}
            render={({ field: { value, onChange } }) => (
              <FormInput
                label={t('form.starting_number')}
                value={value}
                onChange={onChange}
                placeholder="1000"
                wrapperClassname="flex-1"
              />
            )}
          />
          <Controller
            name="contractDate"
            control={control}
            render={({ field: { value, onChange } }) => (
              <FormDatePicker
                label={t('form.contract_date')}
                placeholder="ZZ/LL/AAAAA"
                value={value}
                onChange={onChange}
              />
            )}
          />

          <Controller
            name="contractPeriod"
            control={control}
            render={({ field: { value, onChange } }) => (
              <DateRangePicker
                label={t('form.contract_period')}
                className="flex-1"
                value={value}
                onChange={onChange}
              />
            )}
          />
        </div>
      </div>
      <div className="flex flex-row gap-4">
        <Button
          label={t('clear')}
          className="btn-primary bg-white shadow shadow-amber-200 hover:text-white px-16"
          onClick={handleReset}
        />
        <Button
          label={t('apply_all')}
          className="btn-primary text-white hover:text-black"
          onClick={handleSubmit(onSubmit)}
        />
      </div>
    </>
  );
};
