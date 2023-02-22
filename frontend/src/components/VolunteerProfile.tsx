import React from 'react';
import Card from '../layouts/CardLayout';
import CardBody from './CardBody';
import CardHeader from './CardHeader';
import i18n from '../common/config/i18n';
import FormReadOnlyElement from './FormReadOnlyElement';
import { formatDate } from '../common/utils/utils';
import { VolunteerStatus } from '../pages/Volunteers';
import Button from './Button';
import { PencilIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

interface VolunteerProfileProps {
  email: string;
  phone: string;
  branch: string;
  status: VolunteerStatus;
  department: string;
  startedOn: Date;
  role: string;
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
            <hr className="border-cool-gray-200 col-span-2" />
            <FormReadOnlyElement value={branch} label={i18n.t('division:entity.branch')} />
            <FormReadOnlyElement
              value={`${i18n.t(`volunteer:name`, {
                status: i18n.t(`volunteer:status.${status}`),
              })}`}
              label={`${i18n.t('general:status')} in TEO`}
            />
            <FormReadOnlyElement value={department} label={i18n.t('division:entity.department')} />
            <FormReadOnlyElement
              value={formatDate(startedOn)}
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
