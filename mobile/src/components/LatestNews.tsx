import React from 'react';
import SectionWrapper from './SectionWrapper';
import { View } from 'react-native';
//SVG
import SpeakerphoneSvg from '../assets/svg/speakerphone';
import NewsListItem from './NewsListItem';
import IconSvg from './IconSvg';
import { Button, Text, withStyles } from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';
import { useAnouncementsSnapshot } from '../services/anouncement/anouncement.service';

interface LatestNewsProps {
  navigation: any;
  eva?: any;
}

const LatestNews = ({ navigation, eva }: LatestNewsProps) => {
  const { t } = useTranslation('home');

  const { isFetching: isLoadingAnouncements, data: anouncements } = useAnouncementsSnapshot();

  const onViewNewsButtonPress = () => {
    navigation.navigate('announcements');
  };

  const onAnouncementItemPress = (id: string) => {
    console.log('id', id);
  };

  // add skeleton loading
  if (isLoadingAnouncements) {
    return <></>;
  }

  // Handle no data scenario
  if (anouncements?.items.length === 0) {
    return <></>;
  }

  return (
    <SectionWrapper
      title={t('anouncements.section.header')}
      icon={<IconSvg icon={SpeakerphoneSvg} size={20} />}
      action={
        <Button
          style={eva.style.seeAllBtn}
          size="tiny"
          appearance="ghost"
          onPress={onViewNewsButtonPress}
        >
          {() => (
            <Text category="c2" style={eva.style.seeAllText}>{`${t(
              'anouncements.section.see_all',
            )}`}</Text>
          )}
        </Button>
      }
    >
      <View style={eva.style.list}>
        {anouncements?.items.map((item) => (
          <NewsListItem
            key={item.id}
            icon={item.organizationLogo}
            title={item.title}
            subtitle={item.description}
            onPress={onAnouncementItemPress.bind(null, item.id)}
          />
        ))}
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
    backgroundColor: theme['turquoise-50'],
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  seeAllText: {
    color: theme['color-success-700'],
  },
}));
