import React, { useEffect, useState } from 'react';
import { TableColumn } from 'react-data-table-component';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { CheckCircleIcon, EnvelopeIcon, NoSymbolIcon } from '@heroicons/react/24/outline';
import PageLayout from '../layouts/PageLayout';
import PageHeaderAdd from '../components/PageHeaderAdd';
import Card from '../layouts/CardLayout';
import CardBody from '../components/CardBody';
import DataTableComponent from '../components/DataTableComponent';
import Popover from '../components/Popover';
import StatusWithMarker from '../components/StatusWithMarker';
import ConfirmationModal from '../components/ConfirmationModal';
import Modal from '../components/Modal';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { IAddAdmin, ITeamMember, TeamMemberStatus } from '../common/interfaces/team.interface';
import {
  TeamApiError,
  useAddAdminMutation,
  useSendInviteMutation,
  useSetAdminStatusMutation,
  useTeamQuery,
} from '../services/team/team.service';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { getAuthErrorCode } from '../common/utils/auth-error';
import { formatDateWithTime } from '../common/utils/utils';

const STATUS_COLOR: Record<TeamMemberStatus, string> = {
  active: 'bg-green-500',
  invite_sent: 'bg-yellow-500',
  invite_expired: 'bg-red-500',
  disabled: 'bg-cool-gray-400',
  no_login: 'bg-cool-gray-400',
};

// Statuses that can get an invite: the admin has never logged in (ORG_009 otherwise).
const INVITABLE: TeamMemberStatus[] = ['invite_sent', 'invite_expired', 'no_login'];

const daysUntil = (date: string): number =>
  Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000));

type PendingAction =
  | { kind: 'invite'; member: ITeamMember }
  | { kind: 'disable'; member: ITeamMember }
  | { kind: 'enable'; member: ITeamMember };

// /organization/team: the organization's admins, invites and Disable / Enable (W3).
const Team = () => {
  const { t } = useTranslation('team');
  const { profile } = useAuth();
  const [action, setAction] = useState<PendingAction | null>(null);
  const [showAdd, setShowAdd] = useState<boolean>(false);

  const { data: team, isLoading, error } = useTeamQuery();
  const sendInvite = useSendInviteMutation();
  const setStatus = useSetAdminStatusMutation();
  const addAdmin = useAddAdminMutation();

  useEffect(() => {
    if (error) useErrorToast(t('errors.load'));
  }, [error]);

  const showError = (err: TeamApiError) => {
    const code = err.response?.data?.code_error;
    if (err.response?.status === 429) {
      useErrorToast(t('errors.too_many'));
    } else if (code && code.startsWith('ORG_')) {
      useErrorToast(InternalErrors.ORGANIZATION_ERRORS.getError(code));
    } else {
      const authCode = getAuthErrorCode(err);
      useErrorToast(authCode ? InternalErrors.AUTH_ERRORS.getError(authCode) : t('errors.generic'));
    }
  };

  const confirm = () => {
    if (!action) return;
    const { member } = action;
    setAction(null);

    if (action.kind === 'invite') {
      sendInvite.mutate(member.id, {
        onSuccess: ({ maskedEmail }) =>
          useSuccessToast(t('toast.invite_sent', { email: maskedEmail })),
        onError: showError,
      });
      return;
    }
    const enabled = action.kind === 'enable';
    setStatus.mutate(
      { userId: member.id, enabled },
      {
        onSuccess: () =>
          useSuccessToast(t(enabled ? 'toast.enabled' : 'toast.disabled', { name: member.name })),
        onError: showError,
      },
    );
  };

  const statusLabel = (member: ITeamMember): string =>
    member.status === 'invite_sent' && member.inviteExpiresAt
      ? t('status.invite_sent', { days: daysUntil(member.inviteExpiresAt) })
      : t(`status.${member.status}`);

  const actionsFor = (member: ITeamMember) => {
    const items = [];
    if (INVITABLE.includes(member.status)) {
      items.push({
        label: t('actions.send_invite'),
        icon: <EnvelopeIcon className="menu-icon" />,
        onClick: () => setAction({ kind: 'invite', member }),
      });
    }
    // Nobody changes their own status (ORG_010).
    if (member.id !== profile?.id) {
      items.push(
        member.status === 'disabled'
          ? {
              label: t('actions.enable'),
              icon: <CheckCircleIcon className="menu-icon" />,
              onClick: () => setAction({ kind: 'enable', member }),
              primary: true,
            }
          : {
              label: t('actions.disable'),
              icon: <NoSymbolIcon className="menu-icon" />,
              onClick: () => setAction({ kind: 'disable', member }),
              alert: true,
            },
      );
    }
    return items;
  };

  const columns: TableColumn<ITeamMember>[] = [
    {
      id: 'name',
      name: t('columns.name'),
      grow: 2,
      cell: (member) => (
        <div className="flex flex-col py-2">
          <span>
            {member.name}
            {member.id === profile?.id && <span className="text-cool-gray-500"> ({t('you')})</span>}
          </span>
          <small className="text-cool-gray-500">{member.email}</small>
        </div>
      ),
    },
    { id: 'phone', name: t('columns.phone'), selector: (member) => member.phone },
    {
      id: 'status',
      name: t('columns.status'),
      minWidth: '12rem',
      cell: (member) => (
        <StatusWithMarker markerColor={STATUS_COLOR[member.status]}>
          {statusLabel(member)}
        </StatusWithMarker>
      ),
    },
    {
      id: 'lastLogin',
      name: t('columns.last_login'),
      selector: (member) => formatDateWithTime(member.lastLoginAt),
    },
    {
      id: 'lastInvite',
      name: t('columns.last_invite'),
      minWidth: '12rem',
      cell: (member) =>
        member.lastInviteSentAt ? (
          <div className="flex flex-col">
            <span>{formatDateWithTime(member.lastInviteSentAt)}</span>
            <small className="text-cool-gray-500">
              {member.lastInviteSentBy ?? t('transition_link')}
            </small>
          </div>
        ) : (
          '-'
        ),
    },
    {
      name: '',
      width: '50px',
      allowOverflow: true,
      cell: (member) => {
        const items = actionsFor(member);
        return items.length ? <Popover<ITeamMember> row={member} items={items} /> : null;
      },
    },
  ];

  return (
    <PageLayout>
      <PageHeaderAdd onAddButtonPress={() => setShowAdd(true)} label={t('add_admin')}>
        {t('title')}
      </PageHeaderAdd>
      <p className="text-cool-gray-500">{t('description')}</p>
      <Card>
        <CardBody>
          <DataTableComponent<ITeamMember>
            columns={columns}
            data={team}
            loading={isLoading || sendInvite.isLoading || setStatus.isLoading}
          />
        </CardBody>
      </Card>

      {action && (
        <ConfirmationModal
          title={t(`confirm.${action.kind}.title`)}
          description={t(`confirm.${action.kind}.description`, {
            name: action.member.name,
            email: action.member.email,
          })}
          confirmBtnLabel={t(`confirm.${action.kind}.button`)}
          confirmBtnClassName={action.kind === 'disable' ? 'btn-danger' : 'btn-primary'}
          onClose={() => setAction(null)}
          onConfirm={confirm}
        />
      )}

      {showAdd && (
        <AddAdminModal
          isLoading={addAdmin.isLoading}
          onClose={() => setShowAdd(false)}
          onSubmit={(data) =>
            addAdmin.mutate(data, {
              onSuccess: ({ maskedEmail }) => {
                setShowAdd(false);
                useSuccessToast(t('toast.invite_sent', { email: maskedEmail }));
              },
              onError: showError,
            })
          }
        />
      )}
    </PageLayout>
  );
};

interface AddAdminModalProps {
  isLoading: boolean;
  onClose: () => void;
  onSubmit: (data: IAddAdmin) => void;
}

const AddAdminModal = ({ isLoading, onClose, onSubmit }: AddAdminModalProps) => {
  const { t } = useTranslation('team');

  const schema = yup.object({
    firstName: yup.string().trim().required(t('form.required')).min(2).max(50),
    lastName: yup.string().trim().required(t('form.required')).min(2).max(50),
    email: yup.string().trim().required(t('form.required')).email(t('form.email_invalid')),
    phone: yup.string().trim().required(t('form.required')).max(20),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<IAddAdmin>({
    defaultValues: { firstName: '', lastName: '', email: '', phone: '' },
    resolver: yupResolver(schema),
  });

  const fields: { name: keyof IAddAdmin; type: string }[] = [
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
        <div className="flex justify-end gap-3">
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

export default Team;
