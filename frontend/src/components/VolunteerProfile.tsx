import React from 'react';
import Card from '../layouts/CardLayout';
import CardBody from './CardBody';
import CardHeader from './CardHeader';
import i18n from '../common/config/i18n';
import FormReadOnlyElement from './FormReadOnlyElement';
import { formatDate, VolunteerProfileStatusTextColorMapper } from '../common/utils/utils';
import Button from './Button';
import { PencilIcon } from '@heroicons/react/24/outline';
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
}: VolunteerProfileProps) => {
  const navigate = useNavigate();

  const onEdit = () => {
    navigate('edit');
  };

  return (
    <Card>
      <CardHeader>
        <h2>{i18n.t('volunteer:card_title')}</h2>
        <Button
          className="btn-outline-secondary w-20"
          label={i18n.t('general:edit', { item: '' })}
          icon={<PencilIcon className="h-5 w-5 text-cool-gray-500" />}
          onClick={onEdit}
        />
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
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default VolunteerProfile;
