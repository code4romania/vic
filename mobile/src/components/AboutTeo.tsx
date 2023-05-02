import React from 'react';
import SectionWrapper from './SectionWrapper';
import StatisticsCard from './StatisticsCard';
//SVG
import EllipseSvg from '../assets/svg/ellipse';
import SunSvg from '../assets/svg/sun';
import UserGroupSvg from '../assets/svg/user-group';
import IconSvg from './IconSvg';
import HorizontalCarousel from './HorizontalCarousel';

const AboutTeo = () => {
  return (
    <SectionWrapper title="Despre TEO" icon={<IconSvg icon={EllipseSvg} size={20} />}>
      <HorizontalCarousel>
        <StatisticsCard
          icon={<IconSvg icon={SunSvg} size={56} />}
          title="2500"
          subtitle="voluntari activi"
          backgroundColor="turquoise-50"
          onPress={() => console.log('statistic comp 1 pressed')}
        />
        <StatisticsCard
          icon={<IconSvg icon={UserGroupSvg} size={56} />}
          title="210"
          subtitle="organizații"
          backgroundColor="turquoise-50"
          onPress={() => console.log('statistic comp 2 pressed')}
        />
      </HorizontalCarousel>
    </SectionWrapper>
  );
};

export default AboutTeo;
