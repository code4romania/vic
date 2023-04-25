import React from 'react';
import SectionWrapper from './SectionWrapper';
import { SvgXml } from 'react-native-svg';
import StatisticComponent from './StatisticComponent';
import { ScrollView, StyleSheet } from 'react-native';
//SVG
import StarSvg from '../assets/svg/star';
import ClockSvg from '../assets/svg/clock';
import CalendarSvg from '../assets/svg/calendar';
import DocumentSvg from '../assets/svg/document';

const ThisMonthSection = () => {
  return (
    <SectionWrapper title="Luna asta" icon={<SvgXml xml={StarSvg} width={20} height={20} />}>
      <ScrollView horizontal={true} contentContainerStyle={styles.scrollView}>
        <StatisticComponent
          icon={<SvgXml xml={CalendarSvg} />}
          title="3 evenimente"
          subtitle="luna asta"
          backgroundColor="turquoise-50"
          onPress={() => console.log('statistic comp 1 pressed')}
        />
        <StatisticComponent
          icon={<SvgXml xml={ClockSvg} />}
          title="3 evenimente"
          subtitle="luna asta"
          backgroundColor="turquoise-50"
          onPress={() => console.log('statistic comp 2 pressed')}
        />
        <StatisticComponent
          icon={<SvgXml xml={DocumentSvg} />}
          title="3 evenimente"
          subtitle="luna asta"
          backgroundColor="turquoise-50"
          onPress={() => console.log('statistic comp 3 pressed')}
        />
        <StatisticComponent
          icon={<SvgXml xml={ClockSvg} />}
          title="3 evenimente"
          subtitle="luna asta"
          backgroundColor="turquoise-50"
          onPress={() => console.log('statistic comp 4 pressed')}
        />
        <StatisticComponent
          icon={<SvgXml xml={CalendarSvg} />}
          title="3 evenimente"
          subtitle="luna asta"
          backgroundColor="turquoise-50"
          onPress={() => console.log('statistic comp 5 pressed')}
        />
      </ScrollView>
    </SectionWrapper>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    gap: 16,
  },
});

export default ThisMonthSection;
