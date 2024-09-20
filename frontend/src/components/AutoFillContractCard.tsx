import React, { useEffect } from 'react';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import FormInput from './FormInput';
import FormDatePicker from './FormDatePicker';
import DateRangePicker from './DateRangePicker';
import { useTranslation } from 'react-i18next';
import Button from './Button';

interface AutoFillContractCardProps {
  onSubmit: ({ startingNumber, contractDate, contractPeriod }: FieldValues) => void;
}

export const AutoFillContractCard = ({
  onSubmit,
}: AutoFillContractCardProps) => {
  const { control, reset, handleSubmit, watch, setValue } = useForm();

  const handleReset = () => {
    reset({});
  };
  const { t } = useTranslation('fast_contract_fill');

  const contractDate = watch('contractDate');

  useEffect(() => {
    setValue('contractPeriod', [null, null]);
  }, [contractDate]);

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
                type="number"
              />
            )}
          />
          <Controller
            name="contractDate"
            control={control}
            render={({ field: { value, onChange } }) => (
              <FormDatePicker
                label={t('form.contract_date')}
                placeholder="ZZ.LL.AAAA"
                value={value}
                onChange={onChange}
                minDate={new Date()}
                maxDate={new Date(new Date().setMonth(new Date().getMonth() + 6))}
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
                minDate={contractDate}
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
