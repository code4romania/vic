import React from 'react';
import SectionWrapper from './SectionWrapper';
import { View } from 'react-native';
//SVG
import SpeakerphoneSvg from '../assets/svg/speakerphone';
import LogoSvg from '../assets/svg/logo.js';
import NewsListItem from './NewsListItem';
import IconSvg from './IconSvg';
import { Button, withStyles } from '@ui-kitten/components';
import i18n from '../common/config/i18n';

interface LatestNewsProps {
  navigation: any;
  eva?: any;
}

const LatestNews = ({ navigation, eva }: LatestNewsProps) => {
  const onViewNewsButtonPress = () => {
    navigation.navigate('news');
  };

  return (
    <SectionWrapper
      title={i18n.t('general:latest_news')}
      icon={<IconSvg icon={SpeakerphoneSvg} size={20} />}
      action={
        <Button
          style={eva.style.seeAllBtn}
          size="tiny"
          appearance="outline"
          status="success"
          onPress={onViewNewsButtonPress}
        >
          {`${i18n.t('general:see_all')}`}
        </Button>
      }
    >
      <View style={eva.style.list}>
        <NewsListItem
          icon={<IconSvg icon={LogoSvg} size={24} />}
          title="Important! Ne vedem maine la 10!"
          subtitle="La 10:30 este plecarea, nu intarziati!"
          onPress={() => console.log('press')}
        />
        <NewsListItem
          icon={<IconSvg icon={LogoSvg} size={24} />}
          title="Important! Ne vedem maine la 10!"
          subtitle="La 10:30 este plecarea, nu intarziati!"
          onPress={() => console.log('press')}
        />
      </View>
    </SectionWrapper>
  );
};

export default withStyles(LatestNews, (theme) => ({
  list: {
    gap: 16,
  },
  seeAllBtn: {
    borderRadius: 100,
    backgroundColor: theme['turqoise-50'],
  },
}));
