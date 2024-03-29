import React from 'react';
import SectionWrapper from './SectionWrapper';
import StatisticsCard from './StatisticsCard';
//SVG
import HorizontalCarousel from './HorizontalCarousel';
import { useVicStatistics } from '../services/statistics/statistics.service';
import { useTranslation } from 'react-i18next';
import { Text } from '@ui-kitten/components';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import AboutVicSkeleton from './skeleton/about-vic-skeleton';
import { useFocusEffect } from '@react-navigation/native';

const AboutVic = () => {
  const { t } = useTranslation('general');

  const {
    isFetching: isLoadingStatistics,
    data: statistics,
    error: getVicStatisticsError,
    refetch,
  } = useVicStatistics();

  useFocusEffect(
    React.useCallback(() => {
      refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  // add skeleton loading
  if (isLoadingStatistics) {
    return <AboutVicSkeleton />;
  }

  return (
    <SectionWrapper title={t('general:about_vic')}>
      {getVicStatisticsError ? (
        <Text allowFontScaling={ALLOW_FONT_SCALLING} category="c1">{`${t(
          'general:error.load_entries',
        )}`}</Text>
      ) : (
        <HorizontalCarousel>
          <StatisticsCard
            title={`${statistics?.numberOfActiveVolunteers}`}
            subtitle={t('general:active_volunteers')}
            backgroundColor="cool-gray-100"
          />
          <StatisticsCard
            title={`${statistics?.numberOfOrganizations}`}
            subtitle={t('general:organizations').toLowerCase()}
            backgroundColor="cool-gray-100"
          />
        </HorizontalCarousel>
      )}
    </SectionWrapper>
  );
};

export default AboutVic;
