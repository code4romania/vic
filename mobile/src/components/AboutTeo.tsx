import React from 'react';
import SectionWrapper from './SectionWrapper';
import StatisticsCard from './StatisticsCard';
//SVG
import EllipseSvg from '../assets/svg/ellipse';
import IconSvg from './IconSvg';
import HorizontalCarousel from './HorizontalCarousel';
import i18n from '../common/config/i18n';

const AboutTeo = () => {
  return (
    <SectionWrapper
      title={i18n.t('general:about_teo')}
      icon={<IconSvg icon={EllipseSvg} size={20} />}
    >
      <HorizontalCarousel>
        <StatisticsCard
          icon="sun"
          title="2500"
          subtitle={i18n.t('general:active_volunteers')}
          backgroundColor="turquoise-50"
          onPress={() => console.log('statistic comp 1 pressed')}
        />
        <StatisticsCard
          icon="users"
          title="210"
          subtitle={i18n.t('general:organizations').toLowerCase()}
          backgroundColor="turquoise-50"
          onPress={() => console.log('statistic comp 2 pressed')}
        />
      </HorizontalCarousel>
    </SectionWrapper>
  );
};

export default AboutTeo;
