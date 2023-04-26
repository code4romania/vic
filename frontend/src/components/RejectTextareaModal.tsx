import React from 'react';
import Modal from './Modal';
import Button from './Button';
import FormTextarea from './FormTextarea';
import i18n from '../common/config/i18n';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

interface RejectTextareaModalProps {
  title: string;
  label: string;
  onClose: () => void;
  onConfirm: (rejectMessage?: string) => void;
  primaryBtnClassName?: string;
  primaryBtnLabel?: string;
  secondaryBtnLabel?: string;
}

export type RejectTextareaType = {
  rejectMessage: string;
};

const schema = yup
  .object({
    rejectMessage: yup
      .string()
      .required(`${i18n.t('reject_modal:form.required')}`)
      .min(50, `${i18n.t('reject_modal:form.min')}`)
      .max(225, `${i18n.t('reject_modal:form.max')}`),
  })
  .required();

const RejectTextareaModal = ({
  title,
  label,
  onClose,
  onConfirm,
  primaryBtnClassName,
  primaryBtnLabel,
  secondaryBtnLabel,
}: RejectTextareaModalProps) => {
  const onSubmitWithMessage = (data: { rejectMessage: string }) => {
    onConfirm(data.rejectMessage);
    onClose();
  };

  const onSubmitWithoutMessage = () => {
    onConfirm();
    onClose();
  };

  const {
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<RejectTextareaType>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(schema),
  });

  return (
    <Modal onClose={onClose} title={title}>
      <div className="flex flex-col gap-4 max-w-full max-h-full text-left">
        <form>
          <Controller
            name="rejectMessage"
            key="rejectMessage"
            control={control}
            render={({ field: { onChange, value } }) => {
              return (
                <FormTextarea
                  label={label}
                  defaultValue={value}
                  onChange={onChange}
                  errorMessage={errors.rejectMessage?.message as string}
                />
              );
            }}
          />
        </form>
        <div className="flex flex-col-reverse sm:flex-row gap-4 justify-end">
          <Button
            label={secondaryBtnLabel ? secondaryBtnLabel : i18n.t('reject_modal:send')}
            className="btn-outline-secondary w-full sm:w-20"
            onClick={onSubmitWithoutMessage}
          />
          <Button
            label={primaryBtnLabel ? primaryBtnLabel : i18n.t('general:send')}
            className={`${
              primaryBtnClassName ? primaryBtnClassName : 'btn-primary'
            } w-full sm:w-20`}
            onClick={handleSubmit(onSubmitWithMessage)}
          />
        </div>
      </div>
    </Modal>
  );
};

export default RejectTextareaModal;
