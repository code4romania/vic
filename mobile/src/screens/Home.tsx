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
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

const Home = ({ navigation }: any) => {
  const { t } = useTranslation('home');
  const theme = useTheme();

  const { userProfile } = useAuth();

  const onAddVolunteeringHours = () => {
    navigation.navigate('activity-logs');
  };

  return (
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
            <Button
              appearance="outline"
              label={`${t('add_hours')}`}
              style={styles.addButton}
              onPress={onAddVolunteeringHours}
            />
          </View>
        </View>
      </View>
      <Layout style={styles.container}>
        <Statistics />
        <View style={styles.newsContainer}>
          <LatestNews navigation={navigation} />
          <AboutTeo />
        </View>
      </Layout>
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({
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
