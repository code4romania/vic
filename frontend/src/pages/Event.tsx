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
import { PencilIcon } from '@heroicons/react/24/outline';

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
                    label={i18n.t('general:publish')}
                    onClick={onPublish}
                  />
                )}
              </div>
            </CardHeader>
          </Card>
        )}
      </Tabs>
    </PageLayout>
  );
};

export default Event;
