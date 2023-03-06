import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import i18n from '../common/config/i18n';
import PageHeader from '../components/PageHeader';
import PageLayout from '../layouts/PageLayout';
import Tabs from '../components/Tabs';
import { SelectItem } from '../components/Select';
import Card from '../layouts/CardLayout';
import CardHeader from '../components/CardHeader';
import { useEventQuery } from '../services/event/event.service';
import Button from '../components/Button';
import { CalendarIcon, PencilIcon } from '@heroicons/react/24/outline';
import CardBody from '../components/CardBody';
import FormLayout from '../layouts/FormLayout';
import StartingSection from '../components/StartingSection';
import FormReadOnlyElement from '../components/FormReadOnlyElement';
import { formatEventDate, mapTargetsToString } from '../common/utils/utils';

enum TabsStatus {
  EVENT = 'event',
  RESPONSES = 'responses',
}

const EventTabs: SelectItem<TabsStatus>[] = [
  { key: TabsStatus.EVENT, value: i18n.t('events:details') },
  { key: TabsStatus.RESPONSES, value: i18n.t('events:responses_list') },
];

const Event = () => {
  const [tabsStatus, setTabsStatus] = useState<TabsStatus>(TabsStatus.EVENT);
  const navigate = useNavigate();
  const { id } = useParams();

  const { data: event } = useEventQuery(id as string);

  const navigateBack = () => {
    navigate('/events', { replace: true });
  };

  const onTabClick = (tab: TabsStatus) => {
    setTabsStatus(tab);
  };

  const onDelete = () => {
    alert('not yet implemented');
  };

  const onEdit = () => {
    alert('not yet implemented');
  };

  const onArchive = () => {
    alert('not yet implemented');
  };

  const onPublish = () => {
    alert('not yet implemented');
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={navigateBack}>{i18n.t('general:view')}</PageHeader>
      <Tabs<TabsStatus> tabs={EventTabs} onClick={onTabClick}>
        {tabsStatus === TabsStatus.EVENT && event && (
          <Card>
            <CardHeader>
              <h2>{i18n.t('events:details')}</h2>
              <div className="flex flex-row gap-2 sm:gap-4">
                {event.reportedHours && (
                  <Button
                    className="btn-outline-danger"
                    label={i18n.t('general:delete')}
                    onClick={onDelete}
                  />
                )}
                <Button
                  className="btn-outline-secondary"
                  label={i18n.t('general:edit', { item: '' })}
                  icon={<PencilIcon className="h-5 w-5 text-cool-gray-500" />}
                  onClick={onEdit}
                />
                {event.displayStatus === 'published' ? (
                  <Button
                    className="btn-outline-secondary"
                    label={i18n.t('general:archive', { item: '' })}
                    onClick={onArchive}
                  />
                ) : (
                  <Button
                    className="btn-primary"
                    label={i18n.t('general:publish', { context: event.displayStatus })}
                    onClick={onPublish}
                  />
                )}
              </div>
            </CardHeader>
            <CardBody>
              <FormLayout>
                <StartingSection
                  title={`${i18n.t(`events:${event.displayStatus}.subtitle`)}`}
                  subtitle={`${i18n.t(`events:${event.displayStatus}.description`)}`}
                />
                <hr className="border-cool-gray-200 mb-2 mt-10" />

                <h3>{i18n.t('events:details')}</h3>
                <FormReadOnlyElement label={i18n.t('events:form.name.label')} value={event.name} />
                <FormReadOnlyElement
                  label={i18n.t('events:form.start_date.label')}
                  value={`${formatEventDate(event.startDate)}`}
                />
                <FormReadOnlyElement
                  label={i18n.t('events:form.end_date.label')}
                  value={event.endDate ? `${formatEventDate(event.endDate)}` : '-'}
                />
                <FormReadOnlyElement
                  label={i18n.t('events:form.location.label')}
                  value={event.location}
                />
                <FormReadOnlyElement
                  label={i18n.t('events:form.target.label')}
                  value={mapTargetsToString(event)}
                />
                <FormReadOnlyElement
                  label={i18n.t('events:form.description.label')}
                  value={event.description}
                />
                <div className="flex gap-2.5 flex-col">
                  <small className="text-cool-gray-500">{i18n.t('events:form.logo.label')}</small>
                  {event.logo ? (
                    <img
                      src={event.logo}
                      className="w-20 h-20 logo text-transparent"
                      alt={`${event.name} picture`}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-cool-gray-100 grid place-items-center shrink-0">
                      <CalendarIcon className="h-12 w-12 text-gray-500" />
                    </div>
                  )}
                </div>
                <hr className="border-cool-gray-200 mb-2 mt-10" />

                <h3>{i18n.t('events:form.noting.label')}</h3>
                <FormReadOnlyElement
                  label={i18n.t('events:form.noting.label')}
                  value={`${
                    event.mention
                      ? i18n.t('events:form.noting.mention')
                      : i18n.t('events:form.noting.simple')
                  }`}
                />
                <FormReadOnlyElement
                  label={i18n.t('events:form.mention.label')}
                  value={event.mention ? event.mention : `${i18n.t('events:form.mention.empty')}`}
                />
                <hr className="border-cool-gray-200 mb-2 mt-10" />

                <h3>{i18n.t('events:form.task.title')}</h3>
                <div className="flex gap-2.5 flex-col">
                  <small className="text-cool-gray-500">{i18n.t('events:form.task.tasks')}</small>
                  <div className="flex gap-2 flex-wrap">
                    {event.targets.map((target) => (
                      <div
                        key={target.id}
                        className="h-7 rounded-xl bg-gray-100 shadow-sm px-3 grid place-items-center"
                      >
                        <small>{target.name}</small>
                      </div>
                    ))}
                  </div>
                </div>
                <hr className="border-cool-gray-200 mb-2 mt-10" />

                <h3>{i18n.t('events:form.observation.title')}</h3>
                <FormReadOnlyElement
                  label={i18n.t('events:form.observation.label')}
                  value={event.observation}
                />
              </FormLayout>
            </CardBody>
          </Card>
        )}
      </Tabs>
    </PageLayout>
  );
};

export default Event;
