import React from 'react';
import Statistics from '../components/Statistics';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Layout, Text, useTheme } from '@ui-kitten/components';
import LatestNews from '../components/LatestNews';
import AboutTeo from '../components/AboutTeo';
import Paragraph from '../components/Paragraph';
import Button from '../components/Button';
import WaveSvg from '../assets/svg/wave';
import IconSvg from '../components/IconSvg';
import { useTranslation } from 'react-i18next';
import { useUserProfile } from '../store/profile/profile.selector';

const Home = ({ navigation }: any) => {
  const { t } = useTranslation('home');
  const theme = useTheme();

  const { userProfile } = useUserProfile();

  const onAddVolunteeringHours = () => {
    navigation.navigate('activity-logs');
  };

  const onJoinOrganization = () => {
    navigation.navigate('search');
  };

  return (
    <View style={styles.scrollViewContainer}>
      <ScrollView
        bouncesZoom={false}
        alwaysBounceHorizontal={false}
        alwaysBounceVertical={false}
        bounces={false}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerContainer}>
          <View style={{ ...styles.headerShape, backgroundColor: theme['color-success-500'] }}>
            <Text style={styles.greetingText} category="h3">
              {`${t('greeting', { name: userProfile?.firstName || '' })}`}{' '}
              <IconSvg icon={WaveSvg} size={14} />
            </Text>
            <Paragraph style={styles.paragraph}>{`${t('paragraph')}`}</Paragraph>

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
            <AboutTeo />
          </View>
        </Layout>
      </ScrollView>
    </View>
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
    width: '75%',
    alignItems: 'flex-start',
  },
  addButton: { backgroundColor: 'white', borderWidth: 0 },
  paragraph: {
    color: 'white',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingLeft: 16,
    paddingTop: 22,
  },
  newsContainer: {
    paddingRight: 16,
    paddingVertical: 32,
    flex: 1,
    flexDirection: 'column',
    gap: 32,
  },
});
