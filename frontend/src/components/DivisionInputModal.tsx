import React, { useEffect } from 'react';
import Modal from './Modal';
import { Controller, useForm } from 'react-hook-form';
import Button from './Button';
import * as yup from 'yup';
import i18n from '../common/config/i18n';
import { yupResolver } from '@hookform/resolvers/yup';
import { REGEX } from '../common/constants/patterns';
import FormInput from './FormInput';
import { DivisionType } from '../common/enums/division-type.enum';

interface DivisionInputModalProps {
  title: string;
  divisionType: DivisionType;
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
      .required(`${i18n.t('division:form.name.required')}`)
      .min(2, `${i18n.t('division:form.name.min', { value: '2' })}`)
      .max(
        50,
        `${i18n.t('division:form.name.max', {
          value: '50',
        })}`,
      )
      .matches(REGEX.NAME_REGEX, `${i18n.t('division:form.name.pattern')}`),
  })
  .required();

const DivisionInputModal = ({
  title,
  divisionType,
  onClose,
  onSubmit,
  defaultValue,
}: DivisionInputModalProps) => {
  const {
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<DivisionFormTypes>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (defaultValue) reset({ name: defaultValue });
  }, []);

  return (
    <Modal title={title} onClose={onClose}>
      <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
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
                value={value}
                label={`${i18n.t('activity_types:form.name.placeholder')} ${i18n
                  .t(`division:entity.${divisionType}`)
                  .toLowerCase()}`}
                onChange={onChange}
              />
            );
          }}
        />
      </form>
      <div className="flex flex-row-reverse">
        <Button
          label={i18n.t('general:save')}
          className="btn-primary"
          onClick={handleSubmit(onSubmit)}
        />
      </div>
    </Modal>
  );
};

export default DivisionInputModal;
