import React from 'react';
import { useNavigate } from 'react-router-dom';
import i18n from '../common/config/i18n';
import * as yup from 'yup';
import PageHeader from '../components/PageHeader';
import PageLayout from '../layouts/PageLayout';
import Card from '../layouts/CardLayout';
import CardHeader from '../components/CardHeader';
import Button from '../components/Button';
import { CloudArrowUpIcon, PencilIcon } from '@heroicons/react/24/outline';
import CardBody from '../components/CardBody';
import LoadingContent from '../components/LoadingContent';
import EventForm, { EventFormTypes } from '../components/EventForm';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDivisionsListItemsQuery } from '../services/division/division.service';
import { mapItemToMultiListItem } from '../components/MultiSelect';
import { DivisionType } from '../common/enums/division-type.enum';

const validationSchema = yup.object({
  name: yup
    .string()
    .required(`${i18n.t('announcement:form.name.required')}`)
    .min(2, `${i18n.t('announcement:form.name.min', { value: '2' })}`)
    .max(30, `${i18n.t('announcement:form.name.max', { value: '30' })}`),
  description: yup
    .string()
    .required(`${i18n.t('announcement:form.description.required')}`)
    .min(2, `${i18n.t('announcement:form.description.min', { value: '2' })}`)
    .max(1000, `${i18n.t('announcement:form.description.max', { value: '1000' })}`),
  targets: yup.array().optional(),
});

const AddEvent = () => {
  const navigate = useNavigate();

  const { data: divisionListItems, isLoading: isDivisionListItemsLoading } =
    useDivisionsListItemsQuery(DivisionType.DEPARTMENT);

  const {
    // handleSubmit,
    control,
    formState: { errors },
  } = useForm<EventFormTypes>({
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: yupResolver(validationSchema),
  });

  const navigateBack = () => {
    navigate('/events', { replace: true });
  };

  const onSaveAsDraft = () => {
    alert('not yet implemented');
  };

  const onPublish = () => {
    alert('not yet implemented');
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={navigateBack}>
        {i18n.t('general:add', { item: '' })}
      </PageHeader>
      {isDivisionListItemsLoading && <LoadingContent />}
      <Card>
        <CardHeader>
          <h2>{i18n.t('general:event')}</h2>
          <div className="flex flex-row gap-2 sm:gap-4">
            <Button
              className="btn-outline-secondary"
              label={i18n.t('general:save_as_draft')}
              icon={<PencilIcon className="h-5 w-5 text-cool-gray-500" />}
              onClick={onSaveAsDraft}
            />
            <Button
              className="btn-primary"
              label={i18n.t('general:publish')}
              icon={<CloudArrowUpIcon className="h-5 w-5 sm:hidden" />}
              onClick={onPublish}
            />
          </div>
        </CardHeader>
        <CardBody>
          {divisionListItems && (
            <EventForm
              control={control}
              errors={errors}
              targetsOptions={divisionListItems.map(mapItemToMultiListItem)}
            />
          )}
        </CardBody>
      </Card>
    </PageLayout>
  );
};

export default AddEvent;
