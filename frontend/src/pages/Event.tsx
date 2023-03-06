import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import i18n from '../common/config/i18n';
import PageHeader from '../components/PageHeader';
import PageLayout from '../layouts/PageLayout';
import Tabs from '../components/Tabs';
import { SelectItem } from '../components/Select';
import Card from '../layouts/CardLayout';
import CardHeader from '../components/CardHeader';

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

  const navigateBack = () => {
    navigate('/events', { replace: true });
  };

  const onTabClick = (tab: TabsStatus) => {
    setTabsStatus(tab);
  };

  return (
    <PageLayout>
      <PageHeader onBackButtonPress={navigateBack}>{i18n.t('general:view')}</PageHeader>
      <Tabs<TabsStatus> tabs={EventTabs} onClick={onTabClick}>
        {tabsStatus === TabsStatus.EVENT && (
          <Card>
            <CardHeader>
              <h2>{i18n.t('events:details')}</h2>
            </CardHeader>
          </Card>
        )}
      </Tabs>
    </PageLayout>
  );
};

export default Event;
