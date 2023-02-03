import React from 'react';
import Modal from './Modal';
import { Controller, useForm } from 'react-hook-form';
import Button from './Button';
import * as yup from 'yup';
import { NAME_REGEX } from '../common/utils/utils';
import i18n from '../common/config/i18n';
import { yupResolver } from '@hookform/resolvers/yup';
import Input from './Input';

interface DivisionInputModalProps {
  title: string;
  onClose: () => void;
  onSubmit: (division: DivisionInputTypes) => void;
  defaultValue?: string;
}

type DivisionInputTypes = {
  name: string;
};

const schema = yup
  .object({
    name: yup
      .string()
      .required(`${i18n.t('division:config.required')}`)
      .min(2, `${i18n.t('division:config.min_length')}`)
      .max(20, `${i18n.t('division:config.max_length')}`)
      .matches(NAME_REGEX, `${i18n.t('division:config.pattern')}`),
  })
  .required();

const DivisionInputModal = ({
  title,
  onClose,
  onSubmit,
  defaultValue,
}: DivisionInputModalProps) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<DivisionInputTypes>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  return (
    <Modal title={title} onClose={onClose}>
      <form className="space-y-6">
        <Controller
          key="name"
          name="name"
          control={control}
          render={({ field: { onChange, value } }) => {
            return (
              <Input
                type="text"
                label="Nume"
                className="input"
                onChange={onChange}
                defaultValue={defaultValue || value}
                aria-invalid={errors['name']?.message ? 'true' : 'false'}
              >
                {errors['name']?.message && (
                  <p
                    className="mt-1 sm:text-sm text-xs text-red-600 whitespace-pre-wrap"
                    id={`${errors['name']?.message}__input-error`}
                  >
                    {errors['name']?.message as string}
                  </p>
                )}
              </Input>
            );
          }}
        />
      </form>
      <Button
        label={i18n.t('general:add')}
        className="btn-primary"
        onClick={handleSubmit(onSubmit)}
      />
    </Modal>
  );
};

export default DivisionInputModal;
