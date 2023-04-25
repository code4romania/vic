import React from 'react';
import SectionWrapper from './SectionWrapper';
import { SvgXml } from 'react-native-svg';
import StatisticComponent from './StatisticComponent';
import { ScrollView, StyleSheet } from 'react-native';
//SVG
import EllipseSvg from '../assets/svg/ellipse';
import SunSvg from '../assets/svg/sun';
import UserGroupSvg from '../assets/svg/user-group';

const AboutTeoSection = () => {
  return (
    <SectionWrapper title="Despre TEO" icon={<SvgXml xml={EllipseSvg} width={20} height={20} />}>
      <ScrollView horizontal={true} contentContainerStyle={styles.scrollView}>
        <StatisticComponent
          icon={<SvgXml xml={SunSvg} />}
          title="2500"
          subtitle="voluntari activi"
          backgroundColor="turquoise-50"
          onPress={() => console.log('statistic comp 1 pressed')}
        />
        <StatisticComponent
          icon={<SvgXml xml={UserGroupSvg} />}
          title="210"
          subtitle="organizații"
          backgroundColor="turquoise-50"
          onPress={() => console.log('statistic comp 2 pressed')}
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

export default AboutTeoSection;
