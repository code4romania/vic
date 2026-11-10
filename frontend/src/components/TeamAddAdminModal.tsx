import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { IAddAdmin, TeamMemberStatus } from '../common/interfaces/team.interface';
import { SensitiveAction } from '../services/security/security.api';
import { TeamApiError } from '../services/team/team.service';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { getAuthErrorCode } from '../common/utils/auth-error';
import i18n from '../common/config/i18n';
import { useErrorToast } from '../hooks/useToast';
import Button from './Button';
import FormInput from './FormInput';
import Modal from './Modal';
import SensitiveCodeField from './SensitiveCodeField';
import { BadgeTone } from './StatusBadge';

// Team statuses as solid badges, on Echipa and on Setări.
export const TEAM_STATUS_TONE: Record<TeamMemberStatus, BadgeTone> = {
  active: 'green',
  invite_sent: 'amber',
  invite_expired: 'red',
  disabled: 'gray',
  no_login: 'gray',
};

// The team API errors: rate limit, ORG_ codes, auth codes, or a generic message.
export const showTeamError = (err: TeamApiError) => {
  const code = err.response?.data?.code_error;
  if (err.response?.status === 429) {
    useErrorToast(i18n.t('team:errors.too_many'));
  } else if (code && code.startsWith('ORG_')) {
    useErrorToast(InternalErrors.ORGANIZATION_ERRORS.getError(code));
  } else if ((code as string | undefined) === 'USER_001') {
    // the admin was removed meanwhile (another tab, another admin)
    useErrorToast(i18n.t('team:errors.USER_001'));
  } else {
    const authCode = getAuthErrorCode(err);
    useErrorToast(
      authCode ? InternalErrors.AUTH_ERRORS.getError(authCode) : i18n.t('team:errors.generic'),
    );
  }
};

interface TeamAddAdminModalProps {
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (data: IAddAdmin) => void;
}

// #508: a new admin gets an invite by email; the admin who adds confirms with an emailed code.
const TeamAddAdminModal = ({ isLoading, onClose, onSubmit }: TeamAddAdminModalProps) => {
  const { t } = useTranslation('team');

  const schema = yup.object({
    firstName: yup.string().trim().required(t('form.required')).min(2).max(50),
    lastName: yup.string().trim().required(t('form.required')).min(2).max(50),
    email: yup.string().trim().required(t('form.required')).email(t('form.email_invalid')),
    phone: yup.string().trim().required(t('form.required')).max(20),
    code: yup
      .string()
      .required(t('form.code_required'))
      .matches(/^\d{6}$/, t('form.code_required')),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IAddAdmin>({
    defaultValues: { firstName: '', lastName: '', email: '', phone: '', code: '' },
    resolver: yupResolver(schema),
  });

  const fields: { name: Exclude<keyof IAddAdmin, 'code'>; type: string }[] = [
    { name: 'firstName', type: 'text' },
    { name: 'lastName', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'phone', type: 'tel' },
  ];

  return (
    <Modal title={t('add_admin')} onClose={onClose}>
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit((data) => onSubmit(data))}
        noValidate
      >
        <p className="text-sm text-cool-gray-500">{t('form.description')}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(({ name, type }) => (
            <Controller
              key={name}
              name={name}
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <FormInput
                  type={type}
                  label={t(`form.${name}`)}
                  value={value}
                  onChange={onChange}
                  onBlur={onBlur}
                  errorMessage={errors[name]?.message}
                />
              )}
            />
          ))}
        </div>
        <Controller
          name="code"
          control={control}
          render={({ field: { onChange, value } }) => (
            <SensitiveCodeField
              action={SensitiveAction.ADD_ADMIN}
              value={value}
              onChange={onChange}
              errorMessage={errors.code?.message}
            />
          )}
        />
        <div className="flex flex-wrap justify-end gap-3">
          <Button
            type="button"
            label={t('form.cancel')}
            className="btn-outline-secondary"
            onClick={onClose}
          />
          <Button
            type="submit"
            label={t('form.submit')}
            className="btn-primary"
            disabled={isLoading}
          />
        </div>
      </form>
    </Modal>
  );
};

export default TeamAddAdminModal;
