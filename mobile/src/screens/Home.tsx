import React from 'react';
import Statistics from '../components/Statistics';
import { Platform, RefreshControl, StyleSheet, View } from 'react-native';
import { Layout, Text, useTheme } from '@ui-kitten/components';
import LatestNews from '../components/LatestNews';
import AboutVic from '../components/AboutVic';
import Paragraph from '../components/Paragraph';
import Button from '../components/Button';
import WaveSvg from '../assets/svg/wave';
import IconSvg from '../components/IconSvg';
import { useTranslation } from 'react-i18next';
import { useUserProfile } from '../store/profile/profile.selector';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import { Screen } from '../components/Screen';
import { usePaddingTop } from '../hooks/usePaddingTop';
import { useMonthlyStatistics, useVicStatistics } from '../services/statistics/statistics.service';
import { getUserProfile } from '../services/user/user.api';
import useStore from '../store/store';

const Home = ({ navigation }: any) => {
  const { t } = useTranslation('home');
  const theme = useTheme();
  const paddingTop = usePaddingTop();

  const { userProfile } = useUserProfile();
  const { setUserProfile } = useStore();

  const { isLoading: isRefetchingMonthlyStatistics, refetch: refetchMonthlyStatistics } =
    useMonthlyStatistics();
  const { isLoading: isRefetchingVicStatistics, refetch: refetchVicStatistics } =
    useVicStatistics();

  const onAddVolunteeringHours = () => {
    navigation.navigate('activity-logs');
  };

  const onJoinOrganization = () => {
    navigation.navigate('search');
  };

  const onRefresh = async () => {
    refetchMonthlyStatistics();
    refetchVicStatistics();
    const profile = await getUserProfile();
    setUserProfile(profile);
  };

  return (
    <Screen
      preset="scroll"
      statusBarStyle="light"
      ScrollViewProps={{
        bounces: true,
        // because on ios we add the backdrop for the refresh control, the actual sticky header will be at index 1
        stickyHeaderIndices: Platform.OS === 'ios' ? [1] : [0],
        showsVerticalScrollIndicator: false,
        refreshControl: (
          <RefreshControl
            onRefresh={onRefresh}
            refreshing={isRefetchingMonthlyStatistics || isRefetchingVicStatistics}
            style={{ zIndex: 1 }}
            tintColor="white"
          />
        ),
      }}
    >
      {/* adds background color for the refresh control - only on iOS because on android the loader is on top of the screen */}
      {Platform.OS === 'ios' && (
        <View style={[styles.bounceBackdrop, { backgroundColor: theme['cool-gray-800'] }]} />
      )}
      <View style={styles.headerContainer}>
        <View
          style={{
            ...styles.headerShape,
            backgroundColor: theme['cool-gray-800'],
            paddingTop,
          }}
        >
          <Text allowFontScaling={ALLOW_FONT_SCALLING} style={styles.greetingText} category="h3">
            {`${t('greeting', { name: userProfile?.firstName || '' })}`}{' '}
            <IconSvg icon={WaveSvg} size={16} />
          </Text>
          <Paragraph style={{ color: theme['cool-gray-400'] }}>{`${t('paragraph')}`}</Paragraph>
          {!userProfile?.activeOrganization && (
            <>
              <Text
                allowFontScaling={ALLOW_FONT_SCALLING}
                style={styles.greetingText}
                category="h3"
              >
                {`${t('no_ngo_title')}`}
              </Text>
              <Paragraph style={{ color: theme['cool-gray-400'] }}>{`${t(
                'no_ngo_paragraph',
              )}`}</Paragraph>
            </>
          )}

          <View style={styles.addHoursContainer}>
            {userProfile?.activeOrganization ? (
              <Button
                appearance="outline"
                label={`${t('add_hours')}`}
                style={styles.addButton}
                onPress={onAddVolunteeringHours}
              />
            ) : (
              <Button
                appearance="outline"
                label={`${t('join_ngo')}`}
                style={styles.addButton}
                onPress={onJoinOrganization}
              />
            )}
          </View>
        </View>
      </View>
      <Layout style={styles.container}>
        <Statistics navigation={navigation} />
        <View style={styles.newsContainer}>
          {userProfile?.activeOrganization && <LatestNews navigation={navigation} />}
          <AboutVic />
        </View>
      </Layout>
    </Screen>
  );
};

export default Home;

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  headerContainer: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'white',
  },
  headerShape: {
    flex: 1,
    width: '100%',
    gap: 14,
    padding: 24,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  greetingText: { color: 'white', textAlignVertical: 'center' },
  addHoursContainer: {
    width: '90%',
    alignItems: 'flex-start',
  },
  addButton: { backgroundColor: 'white', borderWidth: 0 },
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingLeft: 16,
    paddingTop: 22,
  },
  newsContainer: {
    paddingRight: 16,
    paddingTop: 16,
    paddingBottom: 32,
    flex: 1,
    flexDirection: 'column',
    gap: 32,
  },
  bounceBackdrop: {
    height: 500,
    position: 'absolute',
    top: -500,
    left: 0,
    right: 0,
  },
});
