import React from 'react';
import SectionWrapper from './SectionWrapper';
import { View } from 'react-native';
//SVG
import SpeakerphoneSvg from '../assets/svg/speakerphone';
import NewsListItem from './NewsListItem';
import IconSvg from './IconSvg';
import { Text, withStyles } from '@ui-kitten/components';
import { useTranslation } from 'react-i18next';
import { useAnouncementsSnapshot } from '../services/anouncement/anouncement.service';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import NewsSkeleton from './skeleton/news-sekeleton';
import { useFocusEffect } from '@react-navigation/native';
import SeeAllAction from './SeeAllAction';

interface LatestNewsProps {
  navigation: any;
  eva?: any;
}

const LatestNews = ({ navigation, eva }: LatestNewsProps) => {
  const { t } = useTranslation('home');

  const {
    isLoading: isLoadingAnouncements,
    data: anouncements,
    error: getAnouncementsError,
    refetch,
  } = useAnouncementsSnapshot();

  useFocusEffect(
    React.useCallback(() => {
      refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const onViewNewsButtonPress = () => {
    navigation.navigate('announcements');
  };

  // add skeleton loading
  if (isLoadingAnouncements) {
    return <NewsSkeleton />;
  }

  return (
    <SectionWrapper
      title={t('anouncements.section.header')}
      icon={<IconSvg icon={SpeakerphoneSvg} size={20} />}
      action={<SeeAllAction onPress={onViewNewsButtonPress} />}
    >
      <>
        {anouncements?.items.length === 0 && (
          <Text allowFontScaling={ALLOW_FONT_SCALLING} category="c1">{`${t(
            'anouncements.section.empty_list',
          )}`}</Text>
        )}
        {getAnouncementsError ? (
          <Text allowFontScaling={ALLOW_FONT_SCALLING} category="c1">{`${t(
            'general:error.load_entries',
          )}`}</Text>
        ) : (
          <View style={eva.style.list}>
            {anouncements?.items.map((item) => (
              <NewsListItem
                expandable
                key={item.id}
                icon={item.organizationLogo}
                title={item.title}
                subtitle={item.description}
              />
            ))}
          </View>
        )}
      </>
    </SectionWrapper>
  );
};

export default withStyles(LatestNews, () => ({
  list: {
    gap: 16,
  },
}));
