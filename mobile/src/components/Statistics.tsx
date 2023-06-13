import React from 'react';
import StarSvg from '../assets/svg/star';
import ClockSvg from '../assets/svg/clock';
import CalendarSvg from '../assets/svg/calendar';
import DocumentSvg from '../assets/svg/document';
import HorizontalCarousel from '../components/HorizontalCarousel';
import StatisticsCard from './StatisticsCard';
import SectionWrapper from '../components/SectionWrapper';
import IconSvg from './IconSvg';
import { useTranslation } from 'react-i18next';

const Statistics = () => {
  const { t } = useTranslation('general');

  return (
    <SectionWrapper title={t('current_month')} icon={<IconSvg icon={StarSvg} size={20} />}>
      <HorizontalCarousel>
        <StatisticsCard
          icon={<IconSvg icon={CalendarSvg} size={56} />}
          title={`${3} ${t('tabs:events').toLowerCase()}`}
          subtitle={t('current_month')}
          backgroundColor="turquoise-50"
          onPress={() => console.log('statistic comp 1 pressed')}
        />
        <StatisticsCard
          icon={<IconSvg icon={ClockSvg} size={56} />}
          title={`${5} ${t('updates')}`}
          subtitle={t('current_month')}
          backgroundColor="turquoise-50"
          onPress={() => console.log('statistic comp 2 pressed')}
        />
        <StatisticsCard
          icon={<IconSvg icon={DocumentSvg} size={56} />}
          title={`${5} ${t('updates')}`}
          subtitle={t('current_month')}
          backgroundColor="turquoise-50"
          onPress={() => console.log('statistic comp 3 pressed')}
        />
        <StatisticsCard
          icon={<IconSvg icon={CalendarSvg} size={56} />}
          title={`${3} ${t('tabs:events').toLowerCase()}`}
          subtitle={t('current_month')}
          backgroundColor="turquoise-50"
          onPress={() => console.log('statistic comp 1 pressed')}
        />
        <StatisticsCard
          icon={<IconSvg icon={ClockSvg} size={56} />}
          title={`${5} ${t('updates')}`}
          subtitle={t('current_month')}
          backgroundColor="turquoise-50"
          onPress={() => console.log('statistic comp 2 pressed')}
        />
      </HorizontalCarousel>
    </SectionWrapper>
  );
};

export default Statistics;
