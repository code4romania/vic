import React from 'react';
import Card from '../layouts/CardLayout';
import CardBody from './CardBody';
import CardHeader from './CardHeader';
import i18n from '../common/config/i18n';
import FormReadOnlyElement from './FormReadOnlyElement';
import { formatDate } from '../common/utils/utils';

interface VolunteerRequestProps {
  email: string;
  phone: string;
  createdOn: Date;
  answers: string[];
}

const VolunteerRequest = ({ email, phone, createdOn, answers }: VolunteerRequestProps) => {
  return (
    <Card>
      <CardHeader>
        <h2>{i18n.t('registration:form')}</h2>
      </CardHeader>
      <CardBody>
        <div className="flex flex-col divide-y divide-cool-gray-200 gap-6 pb-4">
          <div className="grid grid-cols-2 gap-8">
            <FormReadOnlyElement
              value={email}
              valueStyle="text-cool-gray-900"
              label={i18n.t('general:email')}
              labelStyle="text-cool-gray-500"
            />
            <FormReadOnlyElement
              value={phone}
              valueStyle="text-cool-gray-900"
              label={i18n.t('general:phone')}
              labelStyle="text-cool-gray-500"
            />
            <FormReadOnlyElement
              value={formatDate(createdOn)}
              valueStyle="text-cool-gray-900"
              label={i18n.t('general:created_on')}
              labelStyle="text-cool-gray-500"
            />
          </div>
          <div className="pt-4 flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <h3>{i18n.t('registration:answer')}</h3>
              <p className="text-cool-gray-500">{i18n.t('registration:description')}</p>
            </div>
            <div className="flex flex-col gap-5">
              <FormReadOnlyElement
                value={answers[0]}
                label={i18n.t('registration:found_location')}
              />
              <FormReadOnlyElement value={answers[1]} label={i18n.t('registration:motivation')} />
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default VolunteerRequest;
