import React from 'react';
import Modal from './Modal';
import { Controller, useForm } from 'react-hook-form';
import Button from './Button';
import * as yup from 'yup';
import i18n from '../common/config/i18n';
import { yupResolver } from '@hookform/resolvers/yup';
import { REGEX } from '../common/constants/patterns';
import FormInput from './FormInput';

interface DivisionInputModalProps {
  title: string;
  onClose: () => void;
  onSubmit: (division: DivisionFormTypes) => void;
  defaultValue?: string;
}

export type DivisionFormTypes = {
  name: string;
};

const schema = yup
  .object({
    name: yup
      .string()
      .required(`${i18n.t('division:form.required')}`)
      .min(2, `${i18n.t('division:form.min')}`)
      .max(20, `${i18n.t('division:form.max')}`)
      .matches(REGEX.NAME_REGEX, `${i18n.t('division:form.pattern')}`),
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
  } = useForm<DivisionFormTypes>({
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
              <FormInput
                type="text"
                errorMessage={errors['name']?.message}
                readOnly={false}
                value={defaultValue || value}
                label={i18n.t('general:name')}
                onChange={onChange}
                aria-invalid={errors['name']?.message ? 'true' : 'false'}
              />
            );
          }}
        />
      </form>
      <div className="flex flex-row-reverse">
        <Button
          label={i18n.t('general:add')}
          className="btn-primary"
          onClick={handleSubmit(onSubmit)}
        />
      </div>
    </Modal>
  );
};

export default DivisionInputModal;
