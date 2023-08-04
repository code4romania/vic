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
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import AboutTeoSkeleton from './skeleton/about-teo-skeleton';
import { useFocusEffect } from '@react-navigation/native';

const AboutTeo = () => {
  const { t } = useTranslation('general');

  const {
    isFetching: isLoadingStatistics,
    data: statistics,
    error: getTeoStatisticsError,
    refetch,
  } = useTeoStatistics();

  useFocusEffect(
    React.useCallback(() => {
      refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  // add skeleton loading
  if (isLoadingStatistics) {
    return <AboutTeoSkeleton />;
  }

  return (
    <SectionWrapper title={t('general:about_teo')} icon={<IconSvg icon={EllipseSvg} size={20} />}>
      {getTeoStatisticsError ? (
        <Text allowFontScaling={ALLOW_FONT_SCALLING} category="c1">{`${t(
          'general:error.load_entries',
        )}`}</Text>
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
