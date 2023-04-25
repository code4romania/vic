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

const Home = ({ navigation }: any) => {
  const { logout } = useAuth();
  const [showBottomSheet, setShowBottomSheet] = useState(false);

  const onViewNewsButtonPress = () => {
    navigation.navigate('news');
  };

  return (
    <Layout style={styles.layout}>
      <Text category="h1">Dashboard</Text>
      <KittenButton onPress={logout}>logout</KittenButton>
      <Button onPress={onViewNewsButtonPress} label="View News" type={ButtonType.DANGER} />
      <Button
        onPress={() => setShowBottomSheet(true)}
        label="Show Bottom Sheet"
        type={ButtonType.PRIMARY}
      />
      {/* <SectionWrapper title="Luna asta" icon={<SvgXml xml={Star} width={20} height={20} />}>
        <Text status="basic">Eu sunt text</Text>
      </SectionWrapper> */}
      <ThisMonthSection />
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
  );
};

export default Home;

const styles = StyleSheet.create({
  layout: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 15 },
});
