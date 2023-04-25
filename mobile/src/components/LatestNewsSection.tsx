import React from 'react';
import SectionWrapper from './SectionWrapper';
import { SvgXml } from 'react-native-svg';
import { StyleSheet } from 'react-native';
import { View, Button } from 'react-native';
//SVG
import SpeakerphoneSvg from '../assets/svg/speakerphone';
import LogoSvg from '../assets/svg/logo.js';
import NewsListItem from './NewsListItem';

const LatestNewsSection = ({ navigation }: any) => {
  const onViewNewsButtonPress = () => {
    navigation.navigate('news');
  };

  return (
    <SectionWrapper
      title="Ultimele noutăți"
      icon={<SvgXml xml={SpeakerphoneSvg} width={20} height={20} />}
      action={<Button title="Vezi toate" onPress={onViewNewsButtonPress} color="#FF0000" />}
    >
      <View style={styles.list}>
        <NewsListItem
          icon={<SvgXml xml={LogoSvg} width={24} height={24} />}
          title="Important! Ne vedem maine la 10!"
          subtitle="La 10:30 este plecarea, nu intarziati!"
        />
        <NewsListItem
          icon={<SvgXml xml={LogoSvg} width={24} height={24} />}
          title="Important! Ne vedem maine la 10!"
          subtitle="La 10:30 este plecarea, nu intarziati!"
        />
      </View>
    </SectionWrapper>
  );
};

const styles = StyleSheet.create({
  list: {
    gap: 16,
    paddingRight: 16,
  },
});

export default LatestNewsSection;
