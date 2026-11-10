import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { BoltIcon } from '@heroicons/react/24/outline';
import i18n from '../common/config/i18n';
import { ActivityTypeStatus } from '../common/enums/activity-type-status.enum';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import {
  useActivityTypesQuery,
  useArchiveActivityTypeMutation,
  useCreateActivityTypeMutation,
} from '../services/activity-type/activity-type.service';
import ChipCard, { ChipItem } from './ChipCard';
import ConfirmationModal from './ConfirmationModal';

const t = (key: string, options?: Record<string, unknown>): string =>
  `${i18n.t(`organization:setup.chips.${key}`, options)}`;

// The same rules as the activity type form.
const validate = (name: string): string | undefined => {
  if (!name) return `${i18n.t('activity_types:form.name.required')}`;
  if (name.length < 2) return `${i18n.t('activity_types:form.name.min', { value: '2' })}`;
  if (name.length > 50) return `${i18n.t('activity_types:form.name.max', { value: '50' })}`;
};

// Active activity types as chips. A new one gets the default icon; the chip opens the full form
// (icon, department, role, branch). × archives it, as before: hours already logged keep it.
const ActivityTypeChips = () => {
  const navigate = useNavigate();
  const [toArchive, setToArchive] = useState<ChipItem>();
  const { data, refetch } = useActivityTypesQuery(
    undefined,
    undefined,
    undefined,
    undefined,
    ActivityTypeStatus.ACTIVE,
  );
  const { mutateAsync: create } = useCreateActivityTypeMutation();
  const { mutateAsync: archive } = useArchiveActivityTypeMutation();

  const items: ChipItem[] = (data ?? [])
    .filter((type) => type.status === ActivityTypeStatus.ACTIVE)
    .sort((a, b) => a.name.localeCompare(b.name, 'ro'))
    .map(({ id, name }) => ({ id, name }));

  const showError = (error: unknown) =>
    useErrorToast(
      InternalErrors.ACTIVITY_TYPE_ERRORS.getError(
        (error as { response?: { data?: { code_error?: string } } })?.response?.data
          ?.code_error as never,
      ),
    );

  const onAdd = async (name: string) => {
    try {
      await create({ name, icon: 'box' });
      useSuccessToast(i18n.t('activity_types:form.submit.add'));
      refetch();
      return true;
    } catch (error) {
      showError(error);
      return false;
    }
  };

  const onArchive = async () => {
    if (!toArchive) return;
    try {
      await archive(toArchive.id);
      useSuccessToast(i18n.t('activity_types:form.submit.archive'));
      refetch();
    } catch (error) {
      showError(error);
    } finally {
      setToArchive(undefined);
    }
  };

  return (
    <>
      <ChipCard
        title={t('activity.title')}
        subtitle={t('activity.subtitle')}
        icon={<BoltIcon className="w-5 h-5" aria-hidden="true" />}
        items={items}
        addPlaceholder={t('activity.placeholder')}
        addLabel={t('add')}
        emptyText={t('activity.empty')}
        editLabel={(item) => t('edit', { name: item.name })}
        removeLabel={(item) => t('activity.archive_title', { name: item.name })}
        validate={validate}
        onAdd={onAdd}
        onEdit={(item) => navigate(`/activity-types/edit/${item.id}`)}
        onRemove={setToArchive}
        footer={
          <button
            type="button"
            className="self-start text-sm font-robotoMedium text-navy hover:underline"
            onClick={() => navigate('/activity-types')}
          >
            {t('activity.manage')}
          </button>
        }
      />
      {toArchive && (
        <ConfirmationModal
          title={t('activity.archive_title', { name: toArchive.name })}
          description={t('activity.archive_text')}
          confirmBtnLabel={t('activity.archive')}
          confirmBtnClassName="btn-primary"
          onClose={() => setToArchive(undefined)}
          onConfirm={onArchive}
        />
      )}
    </>
  );
};

export default ActivityTypeChips;
