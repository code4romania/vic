import React, { useEffect, useState } from 'react';
import { Media, TableColumn } from 'react-data-table-component';
import { useTranslation } from 'react-i18next';
import {
  CheckCircleIcon,
  EnvelopeIcon,
  NoSymbolIcon,
  PlusIcon,
  ShieldCheckIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import PageLayout from '../layouts/PageLayout';
import PageHeader from '../components/PageHeader';
import Card from '../layouts/CardLayout';
import CardBody from '../components/CardBody';
import CardHeader from '../components/CardHeader';
import DataTableComponent from '../components/DataTableComponent';
import Popover from '../components/Popover';
import StatusBadge from '../components/StatusBadge';
import StatisticsCard from '../components/StatisticsCard';
import InitialsAvatar from '../components/InitialsAvatar';
import ConfirmationModal from '../components/ConfirmationModal';
import Button from '../components/Button';
import CellLayout from '../layouts/CellLayout';
import { useAuth } from '../hooks/useAuth';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import { ITeamMember, TeamMemberStatus } from '../common/interfaces/team.interface';
import {
  useAddAdminMutation,
  useSendInviteMutation,
  useSetAdminStatusMutation,
  useTeamQuery,
} from '../services/team/team.service';
import { formatDateWithTime } from '../common/utils/utils';
import TeamAddAdminModal, {
  showTeamError,
  TEAM_STATUS_TONE,
} from '../components/TeamAddAdminModal';

// The counters on top: who can log in, who still has to accept an invite, who is disabled.
const COUNTERS: {
  key: string;
  statuses: TeamMemberStatus[];
  Icon: typeof UserIcon;
  color: string;
}[] = [
  { key: 'active', statuses: ['active'], Icon: ShieldCheckIcon, color: 'text-navy' },
  {
    key: 'pending',
    statuses: ['invite_sent', 'invite_expired', 'no_login'],
    Icon: EnvelopeIcon,
    color: 'text-figure-amber',
  },
  { key: 'disabled', statuses: ['disabled'], Icon: NoSymbolIcon, color: 'text-cool-gray-500' },
];

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

  const { data: team, isLoading, error, refetch: refetchTeam } = useTeamQuery();
  const sendInvite = useSendInviteMutation();
  const setStatus = useSetAdminStatusMutation();
  const addAdmin = useAddAdminMutation();

  useEffect(() => {
    if (error) useErrorToast(t('errors.load'));
  }, [error]);

  const confirm = () => {
    if (!action) return;
    const { member } = action;
    setAction(null);

    if (action.kind === 'invite') {
      sendInvite.mutate(member.id, {
        onSuccess: ({ maskedEmail }) =>
          useSuccessToast(t('toast.invite_sent', { email: maskedEmail })),
        onError: showTeamError,
      });
      return;
    }
    const enabled = action.kind === 'enable';
    setStatus.mutate(
      { userId: member.id, enabled },
      {
        onSuccess: () =>
          useSuccessToast(t(enabled ? 'toast.enabled' : 'toast.disabled', { name: member.name })),
        onError: showTeamError,
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
      minWidth: '16rem',
      cell: (member) => (
        <div className="flex items-center gap-3 py-2 min-w-0">
          <InitialsAvatar name={member.name} />
          <div className="flex flex-col min-w-0">
            <span className="font-robotoMedium text-cool-gray-900">
              {member.name}
              {member.id === profile?.id && (
                <span className="text-cool-gray-500 font-roboto"> ({t('you')})</span>
              )}
            </span>
            <span className="text-xs text-cool-gray-500 truncate">{member.email}</span>
          </div>
        </div>
      ),
    },
    {
      id: 'phone',
      hide: Media.MD,
      name: t('columns.phone'),
      selector: (member) => member.phone,
    },
    {
      id: 'status',
      name: t('columns.status'),
      minWidth: '10rem',
      cell: (member) => (
        <CellLayout>
          <StatusBadge tone={TEAM_STATUS_TONE[member.status]}>{statusLabel(member)}</StatusBadge>
        </CellLayout>
      ),
    },
    {
      id: 'lastLogin',
      hide: 1100,
      name: t('columns.last_login'),
      selector: (member) => formatDateWithTime(member.lastLoginAt),
    },
    {
      id: 'lastInvite',
      hide: Media.SM,
      name: t('columns.last_invite'),
      minWidth: '12rem',
      cell: (member) =>
        member.lastInviteSentAt ? (
          <div className="flex flex-col">
            <span>{formatDateWithTime(member.lastInviteSentAt)}</span>
            <small className="text-xs text-cool-gray-500">
              {member.lastInviteSentBy ?? t('transition_link')}
            </small>
          </div>
        ) : (
          '–'
        ),
    },
    {
      name: '',
      width: '64px',
      allowOverflow: true,
      cell: (member) => {
        const items = actionsFor(member);
        return items.length ? <Popover<ITeamMember> row={member} items={items} /> : null;
      },
    },
  ];

  const countOf = (statuses: TeamMemberStatus[]) =>
    team ? `${team.filter((member) => statuses.includes(member.status)).length}` : '–';

  return (
    <PageLayout>
      <PageHeader
        subtitle={t('description')}
        actions={
          <Button
            className="btn-primary"
            label={t('add_admin')}
            icon={<PlusIcon className="h-5 w-5" aria-hidden="true" />}
            onClick={() => setShowAdd(true)}
          />
        }
      >
        {t('title')}
      </PageHeader>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 xl:gap-6">
        {COUNTERS.map(({ key, statuses, Icon, color }) => (
          <StatisticsCard
            key={key}
            label={t(`counters.${key}.label`)}
            value={countOf(statuses)}
            icon={<Icon className={`w-5 h-5 ${color}`} aria-hidden="true" />}
            subtitle={t(`counters.${key}.info`)}
          />
        ))}
      </div>
      <Card>
        <CardHeader>
          <div>
            <h2>{t('list.title', { count: team?.length ?? 0 })}</h2>
            <p className="text-sm text-cool-gray-500">{t('list.subtitle')}</p>
          </div>
        </CardHeader>
        <CardBody>
          <DataTableComponent<ITeamMember>
            columns={columns}
            data={team}
            loading={isLoading || sendInvite.isLoading || setStatus.isLoading}
            error={error}
            onRetry={refetchTeam}
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
        <TeamAddAdminModal
          isLoading={addAdmin.isLoading}
          onClose={() => setShowAdd(false)}
          onSubmit={(data) =>
            addAdmin.mutate(data, {
              onSuccess: ({ maskedEmail }) => {
                setShowAdd(false);
                useSuccessToast(t('toast.invite_sent', { email: maskedEmail }));
              },
              onError: showTeamError,
            })
          }
        />
      )}
    </PageLayout>
  );
};

export default Team;
