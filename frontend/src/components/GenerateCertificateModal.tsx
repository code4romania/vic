import React, { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import i18n from '../common/config/i18n';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { ListItem } from '../common/interfaces/list-item.interface';
import { downloadExcel, formatDate } from '../common/utils/utils';
import VolunteerSelect from '../containers/VolunteerSelect';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import {
  useCertificatePrefillQuery,
  useGenerateCertificateMutation,
} from '../services/contracts/contracts.service';
import Button from './Button';
import FormDatePicker from './FormDatePicker';
import FormInput from './FormInput';
import FormTextarea from './FormTextarea';
import Modal from './Modal';

type GenerateCertificateForm = {
  volunteer?: ListItem;
  hours: number;
  purpose: string;
  registrationNumber: string;
  issueDate: Date;
};

const t = (key: string, options?: Record<string, unknown>): string =>
  `${i18n.t(`documents:certificate.form.${key}`, options)}`;

const schema = (withVolunteer: boolean) =>
  yup.object({
    volunteer: withVolunteer
      ? yup.object().required(t('volunteer_required'))
      : yup.object().optional(),
    hours: yup
      .number()
      .typeError(t('hours_required'))
      .required(t('hours_required'))
      .min(0, t('hours_min')),
    purpose: yup.string().trim().required(t('purpose_required')).max(250, t('purpose_max')),
    registrationNumber: yup.string().trim().required(t('number_required')).max(50, t('number_max')),
    issueDate: yup.date().typeError(t('date_required')).required(t('date_required')),
  });

interface GenerateCertificateModalProps {
  // On the volunteer's profile the volunteer is known; on the Documents page it is picked here.
  volunteerId?: string;
  // Called with true after the PDF was generated, so the NGO can upload the signed copy.
  onClose: (generated?: boolean) => void;
}

// VIC 2.0, #490: "Generează adeverință". The total hours start from the volunteer's approved hours and
// can be changed. The PDF follows the standard template; the NGO signs it and uploads it back.
const GenerateCertificateModal = ({ volunteerId, onClose }: GenerateCertificateModalProps) => {
  const [selected, setSelected] = useState<string | undefined>(volunteerId);
  const { data: prefill, isFetching } = useCertificatePrefillQuery(selected);
  const { mutate: generate, isLoading } = useGenerateCertificateMutation();

  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<GenerateCertificateForm>({
    resolver: yupResolver(schema(!volunteerId)) as never,
    defaultValues: { issueDate: new Date(), purpose: '', registrationNumber: '' },
  });

  useEffect(() => {
    if (prefill) setValue('hours', prefill.hours);
  }, [prefill]);

  const onSubmit = (data: GenerateCertificateForm) => {
    generate(
      {
        volunteerId: selected as string,
        hours: +data.hours,
        purpose: data.purpose.trim(),
        registrationNumber: data.registrationNumber.trim(),
        issueDate: data.issueDate,
      },
      {
        onSuccess: ({ data: pdf, fileName }) => {
          downloadExcel(pdf, fileName);
          useSuccessToast(t('success'));
          onClose(true);
        },
        onError: (error) =>
          useErrorToast(InternalErrors.CONTRACT_ERRORS.getError(error.response?.data.code_error)),
      },
    );
  };

  return (
    <Modal title={t('title')} onClose={() => onClose()}>
      <form className="flex flex-col gap-4 text-left" onSubmit={handleSubmit(onSubmit)} noValidate>
        <p className="text-cool-gray-500">{t('description')}</p>
        {!volunteerId && (
          <Controller
            name="volunteer"
            control={control}
            render={({ field: { onChange, value } }) => (
              <VolunteerSelect
                label={t('volunteer')}
                defaultValue={value}
                onSelect={(item) => {
                  onChange(item);
                  setSelected(item?.value as string | undefined);
                }}
                errorMessage={errors.volunteer?.message as string}
              />
            )}
          />
        )}
        <Controller
          name="hours"
          control={control}
          render={({ field: { onChange, value } }) => (
            <FormInput
              type="number"
              min={0}
              step="0.5"
              label={t('hours')}
              value={value ?? ''}
              onChange={onChange}
              disabled={isFetching}
              helper={
                prefill ? (
                  <span>
                    {t('hours_hint', {
                      hours: prefill.hours,
                      since: prefill.since ? formatDate(prefill.since) : '–',
                    })}
                  </span>
                ) : undefined
              }
              errorMessage={errors.hours?.message as string}
            />
          )}
        />
        <Controller
          name="purpose"
          control={control}
          render={({ field: { onChange, value } }) => (
            <FormTextarea
              label={t('purpose')}
              placeholder={t('purpose_placeholder')}
              value={value}
              onChange={onChange}
              errorMessage={errors.purpose?.message as string}
            />
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            name="registrationNumber"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormInput
                type="text"
                label={t('registration_number')}
                value={value}
                onChange={onChange}
                errorMessage={errors.registrationNumber?.message as string}
              />
            )}
          />
          <Controller
            name="issueDate"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormDatePicker
                name="issueDate"
                label={t('issue_date')}
                value={value}
                onChange={onChange}
                errorMessage={errors.issueDate?.message}
              />
            )}
          />
        </div>
        <div className="flex flex-row justify-end gap-3">
          <Button
            type="button"
            label={`${i18n.t('general:cancel')}`}
            className="btn-outline-secondary"
            onClick={() => onClose()}
          />
          <Button type="submit" label={t('submit')} className="btn-primary" disabled={isLoading} />
        </div>
      </form>
    </Modal>
  );
};

export default GenerateCertificateModal;
