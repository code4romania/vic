import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import i18n from '../common/config/i18n';
import Button from './Button';
import FormTextarea from './FormTextarea';
import Modal from './Modal';

type RejectForm = { reason: string };

const schema = yup.object({
  reason: yup
    .string()
    .trim()
    .required(`${i18n.t('events:registrations.reject.required')}`)
    .max(500, `${i18n.t('events:registrations.reject.max', { value: 500 })}`),
});

interface RejectRegistrationModalProps {
  name: string;
  isLoading?: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

// VIC 2.0 (#501): rejecting a registration needs a reason; the volunteer sees it in the app
const RejectRegistrationModal = ({
  name,
  isLoading,
  onClose,
  onConfirm,
}: RejectRegistrationModalProps) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RejectForm>({ resolver: yupResolver(schema), defaultValues: { reason: '' } });

  return (
    <Modal title={i18n.t('events:registrations.reject.title', { name })} onClose={onClose}>
      <form
        className="flex flex-col gap-4 text-left"
        onSubmit={handleSubmit(({ reason }) => onConfirm(reason.trim()))}
        noValidate
      >
        <Controller
          name="reason"
          control={control}
          render={({ field: { onChange, value } }) => (
            <FormTextarea
              label={`${i18n.t('events:registrations.reject.reason')}`}
              defaultValue={value}
              onChange={onChange}
              errorMessage={errors.reason?.message as string}
            />
          )}
        />
        <div className="flex flex-col-reverse sm:flex-row gap-4 justify-end">
          <Button
            type="button"
            label={i18n.t('general:cancel')}
            className="btn-outline-secondary"
            onClick={onClose}
          />
          <Button
            type="submit"
            label={i18n.t('events:registrations.reject.confirm')}
            className="btn-danger"
            disabled={isLoading}
          />
        </div>
      </form>
    </Modal>
  );
};

export default RejectRegistrationModal;
