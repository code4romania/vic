import React from 'react';
import SectionWrapper from './SectionWrapper';
import StatisticsCard from './StatisticsCard';
//SVG
import EllipseSvg from '../assets/svg/ellipse';
import IconSvg from './IconSvg';
import HorizontalCarousel from './HorizontalCarousel';
import { useTeoStatistics } from '../services/statistics/statistics.service';
import { useTranslation } from 'react-i18next';

const AboutTeo = () => {
  const { t } = useTranslation('general');

  const { isFetching: isLoadingStatistics, data: statistics } = useTeoStatistics();

  // add skeleton loading
  if (isLoadingStatistics) {
    return <></>;
  }

  return (
    <SectionWrapper title={t('general:about_teo')} icon={<IconSvg icon={EllipseSvg} size={20} />}>
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
    </SectionWrapper>
  );
};

export default AboutTeo;
