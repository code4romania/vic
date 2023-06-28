import React from 'react';
import StarSvg from '../assets/svg/star';
import HorizontalCarousel from '../components/HorizontalCarousel';
import StatisticsCard from './StatisticsCard';
import SectionWrapper from '../components/SectionWrapper';
import IconSvg from './IconSvg';
import { useMonthlyStatistics } from '../services/statistics/statistics.service';
import { useTranslation } from 'react-i18next';

const Statistics = ({ navigation }: { navigation: any }) => {
  const { t } = useTranslation('home');

  const { isLoading: isFetchingStatistics, data: statistics } = useMonthlyStatistics();
  console.log('statistics', statistics);

  const onEventsCardPress = () => {
    navigation.navigate('events');
  };

  const onHoursCardPress = () => {
    navigation.navigate('news', { activityLogHoursUpdates: true });
  };

  const onDocumentsCardPress = () => {
    navigation.navigate('news', { documentsUpdates: true });
  };

  const onOrganizationsCardPress = () => {
    navigation.navigate('news', { organizationsUpdates: true });
  };

  // TODO: skeleton loading here
  if (isFetchingStatistics) {
    return <></>;
  }

  return (
    <SectionWrapper title={t('general:current_month')} icon={<IconSvg icon={StarSvg} size={20} />}>
      <HorizontalCarousel>
        <StatisticsCard
          icon="calendar"
          title={`${t('statistics.events.title', { number: statistics?.numberOfUpcomingEvents })}`}
          subtitle={t('statistics.events.description')}
          backgroundColor="turquoise-50"
          onPress={onEventsCardPress}
        />
        <StatisticsCard
          icon="clock"
          title={`${t('statistics.hours.title', {
            number: statistics?.numberOfActivityLogUpdates,
          })}`}
          subtitle={t('statistics.hours.description')}
          backgroundColor="turquoise-50"
          onPress={onHoursCardPress}
        />
        <StatisticsCard
          icon="file"
          title={`${t('statistics.documents.title', {
            number: statistics?.numberOfDocumentUpdates,
          })}`}
          subtitle={t('statistics.documents.description')}
          backgroundColor="turquoise-50"
          onPress={onDocumentsCardPress}
        />
        <StatisticsCard
          icon="users"
          title={`${t('statistics.organizations.title', {
            number: statistics?.numberOfOrganizationUpdates,
          })}`}
          subtitle={t('statistics.organizations.description')}
          backgroundColor="turquoise-50"
          onPress={onOrganizationsCardPress}
        />
      </HorizontalCarousel>
    </SectionWrapper>
  );
};

export default Statistics;
