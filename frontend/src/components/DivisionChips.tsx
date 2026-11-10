import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { BuildingOffice2Icon, BriefcaseIcon, UsersIcon } from '@heroicons/react/24/outline';
import i18n from '../common/config/i18n';
import { REGEX } from '../common/constants/patterns';
import { DivisionType } from '../common/enums/division-type.enum';
import { OrderDirection } from '../common/enums/order-direction.enum';
import { InternalErrors } from '../common/errors/internal-errors.class';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';
import {
  useAddDivisionMutation,
  useDeleteDivisionMutation,
  useDivisions,
  useEditDivisionMutation,
} from '../services/division/division.service';
import ChipCard, { ChipItem } from './ChipCard';
import ConfirmationModal from './ConfirmationModal';
import DivisionInputModal, { DivisionFormTypes } from './DivisionInputModal';

const t = (key: string, options?: Record<string, unknown>): string =>
  `${i18n.t(`organization:setup.chips.${key}`, options)}`;

const ICONS: Record<DivisionType, typeof UsersIcon> = {
  [DivisionType.DEPARTMENT]: UsersIcon,
  [DivisionType.ROLE]: BriefcaseIcon,
  [DivisionType.BRANCH]: BuildingOffice2Icon,
};

// The same rules as DivisionInputModal.
export const validateDivisionName = (name: string): string | undefined => {
  if (!name) return `${i18n.t('division:form.name.required')}`;
  if (name.length < 2) return `${i18n.t('division:form.name.min', { value: '2' })}`;
  if (name.length > 50) return `${i18n.t('division:form.name.max', { value: '50' })}`;
  if (!REGEX.NAME_REGEX.test(name)) return `${i18n.t('division:form.name.pattern')}`;
};

// Departments, roles or branches as chips: add inline, rename in the existing modal, delete with
// the existing confirmation; the API keeps its rules (unique names, members).
const DivisionChips = ({ type }: { type: DivisionType }) => {
  const navigate = useNavigate();
  const [toEdit, setToEdit] = useState<ChipItem>();
  const [toDelete, setToDelete] = useState<ChipItem>();
  const { data, refetch } = useDivisions(100, 1, type, 'name', OrderDirection.ASC);
  const { mutateAsync: addDivision } = useAddDivisionMutation();
  const { mutateAsync: editDivision } = useEditDivisionMutation();
  const { mutateAsync: deleteDivision } = useDeleteDivisionMutation();
  const Icon = ICONS[type];

  const items: ChipItem[] = (data?.items ?? []).map((division) => ({
    id: division.id,
    name: division.name,
    meta: division.numberOfMembers ? `· ${division.numberOfMembers}` : undefined,
  }));

  const showError = (error: unknown) =>
    useErrorToast(
      InternalErrors.DIVISION_ERRORS.getError(
        (error as { response?: { data?: { code_error?: string } } })?.response?.data
          ?.code_error as never,
      ),
    );

  const onAdd = async (name: string) => {
    try {
      await addDivision({ name, type });
      useSuccessToast(i18n.t(`division:submit.success.${type}.add`));
      refetch();
      return true;
    } catch (error) {
      showError(error);
      return false;
    }
  };

  const onRename = async ({ name }: DivisionFormTypes) => {
    if (!toEdit) return;
    try {
      await editDivision({ id: toEdit.id, name });
      useSuccessToast(i18n.t(`division:submit.success.${type}.edit`));
      refetch();
    } catch (error) {
      showError(error);
    } finally {
      setToEdit(undefined);
    }
  };

  const onDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteDivision(toDelete.id);
      useSuccessToast(i18n.t(`division:submit.success.${type}.delete`));
      refetch();
    } catch (error) {
      showError(error);
    } finally {
      setToDelete(undefined);
    }
  };

  return (
    <>
      <ChipCard
        title={t(`${type}.title`)}
        subtitle={t(`${type}.subtitle`)}
        icon={<Icon className="w-5 h-5" aria-hidden="true" />}
        items={items}
        addPlaceholder={t(`${type}.placeholder`)}
        addLabel={t('add')}
        emptyText={t(`${type}.empty`)}
        editLabel={(item) => t('edit', { name: item.name })}
        removeLabel={(item) => t('remove', { name: item.name })}
        validate={validateDivisionName}
        onAdd={onAdd}
        onEdit={setToEdit}
        onRemove={setToDelete}
      />
      {toEdit && (
        <DivisionInputModal
          title={i18n.t('general:edit', {
            item: i18n.t(`division:entity.${type}`).toLowerCase(),
          })}
          divisionType={type}
          defaultValue={toEdit.name}
          onClose={() => setToEdit(undefined)}
          onSubmit={onRename}
        >
          <button
            type="button"
            className="self-start text-sm font-robotoMedium text-navy hover:underline"
            onClick={() => navigate(`/volunteers?${type}=${toEdit.name}`)}
          >
            {i18n.t('division:popover.view')}
          </button>
        </DivisionInputModal>
      )}
      {toDelete && (
        <ConfirmationModal
          title={i18n.t('division:modal.delete.title', {
            division: i18n.t(`division:entity.${type}`),
          })}
          description={i18n.t('general:confirm_delete', {
            item: i18n.t(`division:entity.${type}`),
          })}
          confirmBtnLabel={i18n.t('general:delete')}
          confirmBtnClassName="btn-danger"
          onClose={() => setToDelete(undefined)}
          onConfirm={onDelete}
        />
      )}
    </>
  );
};

export default DivisionChips;
