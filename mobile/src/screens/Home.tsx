import React, { useState } from 'react';
import { Layout, Text } from '@ui-kitten/components';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import { Button as KittenButton } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';
import { ButtonType } from '../common/enums/button-type.enum';
import BottomSheet from '../components/BottomSheet';
import ThisMonthSection from '../components/ThisMonthSection';
import AboutTeoSection from '../components/AboutTeoSection';
import LatestNewsSection from '../components/LatestNewsSection';
import { ScrollView } from 'react-native-gesture-handler';

const Home = ({ navigation }: any) => {
  const { logout } = useAuth();
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  const onViewNewsButtonPress = () => {
    navigation.navigate('news');
  };

  return (
    <ScrollView
      bouncesZoom={false}
      alwaysBounceHorizontal={false}
      alwaysBounceVertical={false}
      bounces={false}
      showsVerticalScrollIndicator={false}
    >
      <Layout style={styles.layout}>
        <Text category="h1">Dashboard</Text>
        <KittenButton onPress={logout}>logout</KittenButton>
        <Button onPress={onViewNewsButtonPress} label="View News" type={ButtonType.DANGER} />
        <Button
          onPress={() => setShowBottomSheet(true)}
          label="Show Bottom Sheet"
          type={ButtonType.PRIMARY}
        />
        <ThisMonthSection />
        <LatestNewsSection navigation={navigation} />
        <AboutTeoSection />
        {showBottomSheet && (
          <BottomSheet
            onDismiss={() => {
              setShowBottomSheet(false);
            }}
          >
            <Text>Eu sunt un text simplu</Text>
          </BottomSheet>
        )}
      </Layout>
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({
  layout: { flex: 1, gap: 32, paddingBottom: 40 },
});
