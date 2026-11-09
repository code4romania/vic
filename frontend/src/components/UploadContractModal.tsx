import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import i18n from '../common/config/i18n';
import { DocumentType } from '../common/enums/document-type.enum';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { ListItem } from '../common/interfaces/list-item.interface';
import VolunteerSelect from '../containers/VolunteerSelect';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { useUploadContractMutation } from '../services/contracts/contracts.service';
import Button from './Button';
import FileUpload from './FileUpload';
import FormDatePicker from './FormDatePicker';
import FormInput from './FormInput';
import Modal from './Modal';
import RadioGroup from './RadioGroup';

const MAX_SIZE = 10 * 1024 * 1024;

type UploadContractForm = {
  volunteer?: ListItem;
  contractNumber?: string;
  startDate: Date;
  endDate?: Date | null;
  contract?: File;
};

const t = (key: string): string => `${i18n.t(`documents:contract.upload_form.${key}`)}`;
// #490: a certificate has its own labels; the rest of the form is the contract's
const label = (type: DocumentType, key: string): string =>
  type === DocumentType.CERTIFICATE &&
  i18n.exists(`documents:contract.upload_form.certificate.${key}`)
    ? t(`certificate.${key}`)
    : t(key);

const TypeOptions = Object.values(DocumentType).map((type) => ({
  key: type,
  value: `${i18n.t(`documents:contract.type.${type}`)}`,
}));

const schema = (withVolunteer: boolean, type: DocumentType) =>
  yup.object({
    volunteer: withVolunteer
      ? yup.object().required(t('volunteer_required'))
      : yup.object().optional(),
    contractNumber: yup.string().max(50, t('number_max')),
    startDate: yup
      .date()
      .typeError(label(type, 'start_required'))
      .required(label(type, 'start_required')),
    endDate:
      type === DocumentType.CERTIFICATE
        ? yup.mixed().nullable().optional()
        : yup
            .date()
            .nullable()
            .typeError(`${i18n.t('general:invalid_date')}`)
            .min(yup.ref('startDate'), t('end_after_start')),
    contract: yup.mixed().required(label(type, 'file_required')),
  });

interface UploadContractModalProps {
  // On the volunteer's profile the volunteer is known; on the Contracts page it is picked here.
  volunteerId?: string;
  // #490: the document type the form opens with; the NGO can switch it
  initialType?: DocumentType;
  onClose: (saved?: boolean) => void;
}

// VIC 2.0, #486: VIC no longer generates contracts. The NGO uploads the PDF the volunteer already
// signed, with its period: the start is required, no end date means it never expires.
const UploadContractModal = ({
  volunteerId,
  initialType = DocumentType.CONTRACT,
  onClose,
}: UploadContractModalProps) => {
  const { mutate: upload, isLoading } = useUploadContractMutation();
  const [type, setType] = useState<DocumentType>(initialType);
  const isCertificate = type === DocumentType.CERTIFICATE;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<UploadContractForm>({
    resolver: yupResolver(schema(!volunteerId, type)) as never,
    defaultValues: { endDate: null },
  });

  const onSubmit = (data: UploadContractForm) => {
    upload(
      {
        volunteerId: volunteerId ?? (data.volunteer?.value as string),
        contractNumber: data.contractNumber,
        startDate: data.startDate,
        endDate: isCertificate ? null : data.endDate ?? null,
        contract: data.contract as File,
        type,
      },
      {
        onSuccess: () => {
          useSuccessToast(label(type, 'success'));
          onClose(true);
        },
        onError: (error) =>
          useErrorToast(InternalErrors.CONTRACT_ERRORS.getError(error.response?.data.code_error)),
      },
    );
  };

  return (
    <Modal title={label(type, 'title')} onClose={() => onClose()}>
      <form className="flex flex-col gap-4 text-left" onSubmit={handleSubmit(onSubmit)} noValidate>
        <p className="text-cool-gray-500">{label(type, 'description')}</p>
        <RadioGroup
          name="documentType"
          label={t('type')}
          options={TypeOptions}
          defaultValue={type}
          onChange={(event) => setType(event.target.value as DocumentType)}
        />
        {!volunteerId && (
          <Controller
            name="volunteer"
            control={control}
            render={({ field: { onChange, value } }) => (
              <VolunteerSelect
                label={t('volunteer')}
                defaultValue={value}
                onSelect={onChange}
                errorMessage={errors.volunteer?.message as string}
              />
            )}
          />
        )}
        <Controller
          name="contract"
          control={control}
          render={({ field: { onChange } }) => (
            <FileUpload
              label={label(type, 'file')}
              type="pdf"
              hint={t('file_hint')}
              maxSize={MAX_SIZE}
              rejectedMessage={label(type, 'file_rejected')}
              onChange={onChange}
              errorMessage={errors.contract?.message as string}
            />
          )}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Controller
            name="startDate"
            control={control}
            render={({ field: { onChange, value } }) => (
              <FormDatePicker
                name="startDate"
                label={label(type, 'start_date')}
                value={value}
                onChange={onChange}
                errorMessage={errors.startDate?.message}
              />
            )}
          />
          {!isCertificate && (
            <Controller
              name="endDate"
              control={control}
              render={({ field: { onChange, value } }) => (
                <FormDatePicker
                  name="endDate"
                  label={t('end_date')}
                  helper={<span>{t('end_date_hint')}</span>}
                  value={value as Date | null}
                  onChange={onChange}
                  errorMessage={errors.endDate?.message}
                />
              )}
            />
          )}
        </div>
        <Controller
          name="contractNumber"
          control={control}
          render={({ field: { onChange, value } }) => (
            <FormInput
              type="text"
              label={label(type, 'contract_number')}
              value={value}
              onChange={onChange}
              errorMessage={errors.contractNumber?.message as string}
            />
          )}
        />
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

export default UploadContractModal;
