import React from 'react';
import SectionWrapper from './SectionWrapper';
import StatisticsCard from './StatisticsCard';
//SVG
import EllipseSvg from '../assets/svg/ellipse';
import IconSvg from './IconSvg';
import HorizontalCarousel from './HorizontalCarousel';
import { useTeoStatistics } from '../services/statistics/statistics.service';
import { useTranslation } from 'react-i18next';
import { Text } from '@ui-kitten/components';

const AboutTeo = () => {
  const { t } = useTranslation('general');

  const {
    isFetching: isLoadingStatistics,
    data: statistics,
    error: getTeoStatisticsError,
  } = useTeoStatistics();

  // add skeleton loading
  if (isLoadingStatistics) {
    return <></>;
  }

  return (
    <SectionWrapper title={t('general:about_teo')} icon={<IconSvg icon={EllipseSvg} size={20} />}>
      {getTeoStatisticsError ? (
        <Text category="c1">{`${t('general:error.load_entries')}`}</Text>
      ) : (
        <HorizontalCarousel>
          <StatisticsCard
            icon="sun"
            title={`${statistics?.numberOfActiveVolunteers}`}
            subtitle={t('general:active_volunteers')}
            backgroundColor="turquoise-50"
          />
          <StatisticsCard
            icon="users"
            title={`${statistics?.numberOfOrganizations}`}
            subtitle={t('general:organizations').toLowerCase()}
            backgroundColor="turquoise-50"
          />
        </HorizontalCarousel>
      )}
    </SectionWrapper>
  );
};

export default AboutTeo;
