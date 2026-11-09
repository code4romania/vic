import React, { useEffect, useState } from 'react';
import Card from '../layouts/CardLayout';
import CardBody from './CardBody';
import CardHeader from './CardHeader';
import i18n from '../common/config/i18n';
import FormReadOnlyElement from './FormReadOnlyElement';
import { formatDate, VolunteerProfileStatusTextColorMapper } from '../common/utils/utils';
import Button from './Button';
import { CheckIcon, PencilIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { useNavigate } from 'react-router-dom';
import { VolunteerStatus } from '../common/enums/volunteer-status.enum';

interface VolunteerProfileProps {
  email: string;
  phone: string;
  status: VolunteerStatus;
  startedOn?: Date;
  role?: string;
  department?: string;
  branch?: string;
  createdOn: Date;
  source?: string | null;
  isFavorite?: boolean;
  hasAccount?: boolean;
  onToggleFavorite?: () => void;
  onSaveSource?: (source: string) => void;
  isSaving?: boolean;
}

const VolunteerProfile = ({
  email,
  phone,
  branch,
  status,
  department,
  startedOn,
  role,
  createdOn,
  source,
  isFavorite,
  hasAccount = true,
  onToggleFavorite,
  onSaveSource,
  isSaving,
}: VolunteerProfileProps) => {
  const navigate = useNavigate();
  const [isEditingSource, setIsEditingSource] = useState(false);
  const [sourceDraft, setSourceDraft] = useState(source || '');

  useEffect(() => {
    setSourceDraft(source || '');
  }, [source]);

  const onSubmitSource = () => {
    onSaveSource?.(sourceDraft.trim());
    setIsEditingSource(false);
  };

  const onEdit = () => {
    navigate('edit');
  };

  return (
    <Card>
      <CardHeader>
        <h2>{i18n.t('volunteer:card_title')}</h2>
        <div className="flex gap-2">
          {onToggleFavorite && (
            <Button
              className="btn-outline-secondary"
              label={i18n.t(isFavorite ? 'volunteer:unfavorite' : 'volunteer:favorite')}
              icon={
                isFavorite ? (
                  <StarSolidIcon className="h-5 w-5 text-yellow-500" />
                ) : (
                  <StarIcon className="h-5 w-5 text-cool-gray-500" />
                )
              }
              onClick={onToggleFavorite}
              disabled={isSaving}
            />
          )}
          <Button
            className="btn-outline-secondary w-20"
            label={i18n.t('general:edit', { item: '' })}
            icon={<PencilIcon className="h-5 w-5 text-cool-gray-500" />}
            onClick={onEdit}
          />
        </div>
      </CardHeader>
      <CardBody>
        <div className="flex flex-col divide-y divide-cool-gray-200 gap-6 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormReadOnlyElement value={email} label={i18n.t('general:email')} />
            <FormReadOnlyElement value={phone} label={i18n.t('general:phone')} />
            <hr className="border-cool-gray-200 col-span-full" />
            <FormReadOnlyElement value={branch} label={i18n.t('division:entity.branch')} />
            <div className="flex gap-2.5 flex-col">
              <small className="text-cool-gray-500">{`${i18n.t('general:status')} in VIC`}</small>
              <p className={`${VolunteerProfileStatusTextColorMapper[status]}`}>
                {i18n.t(`volunteer:name`, {
                  status: i18n.t(`volunteer:status.${status}`),
                })}
              </p>
              {!hasAccount && (
                <small className="text-cool-gray-500">{i18n.t('volunteer:no_account')}</small>
              )}
            </div>
            <FormReadOnlyElement value={department} label={i18n.t('division:entity.department')} />
            <FormReadOnlyElement
              value={startedOn ? formatDate(startedOn) : '-'}
              label={i18n.t('volunteer:name', {
                status: i18n.t('pagination:range_separator_text'),
              })}
            />
            <FormReadOnlyElement value={role} label={i18n.t('division:entity.role')} />
            <FormReadOnlyElement
              value={formatDate(createdOn)}
              label={i18n.t('volunteer:volunteer_from')}
            />
            <div className="flex gap-2.5 flex-col">
              <small className="text-cool-gray-500">{i18n.t('volunteer:source')}</small>
              {isEditingSource ? (
                <div className="flex gap-2 items-center">
                  <input
                    className="flex-1"
                    aria-label={i18n.t('volunteer:source')}
                    value={sourceDraft}
                    maxLength={100}
                    placeholder={i18n.t('volunteer:source_placeholder')}
                    onChange={(event) => setSourceDraft(event.target.value)}
                    onKeyDown={(event) => event.key === 'Enter' && onSubmitSource()}
                    autoFocus
                  />
                  <Button
                    className="btn-outline-secondary"
                    label={i18n.t('general:save')}
                    icon={<CheckIcon className="h-5 w-5 text-cool-gray-500" />}
                    onClick={onSubmitSource}
                    disabled={isSaving}
                  />
                </div>
              ) : (
                <div className="flex gap-2 items-center">
                  <p>{source || '-'}</p>
                  {onSaveSource && (
                    <button
                      type="button"
                      aria-label={i18n.t('general:edit', { item: i18n.t('volunteer:source') })}
                      onClick={() => setIsEditingSource(true)}
                    >
                      <PencilIcon className="h-4 w-4 text-cool-gray-500" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default VolunteerProfile;
