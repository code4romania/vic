import React, { useState } from 'react';
import { Layout, Text } from '@ui-kitten/components';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import { Button as KittenButton } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';
import { ButtonType } from '../common/enums/button-type.enum';
import BottomSheet from '../components/BottomSheet';
import SectionWrapper from '../components/SectionWrapper';
import { SvgXml } from 'react-native-svg';

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
      <SectionWrapper
        title="Luna asta"
        icon={
          <SvgXml
            xml='<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fill-rule="evenodd" clip-rule="evenodd" d="M3 0C3.55228 0 4 0.447715 4 1V2H5C5.55228 2 6 2.44772 6 3C6 3.55228 5.55228 4 5 4H4V5C4 5.55228 3.55228 6 3 6C2.44772 6 2 5.55228 2 5V4H1C0.447715 4 0 3.55228 0 3C0 2.44772 0.447715 2 1 2H2V1C2 0.447715 2.44772 0 3 0ZM3 10C3.55228 10 4 10.4477 4 11V12H5C5.55228 12 6 12.4477 6 13C6 13.5523 5.55228 14 5 14H4V15C4 15.5523 3.55228 16 3 16C2.44772 16 2 15.5523 2 15V14H1C0.447715 14 0 13.5523 0 13C0 12.4477 0.447715 12 1 12H2V11C2 10.4477 2.44772 10 3 10Z" fill="#FBBF24"/>
              <path fill-rule="evenodd" clip-rule="evenodd" d="M9.99995 0C10.4537 0 10.8505 0.305483 10.9667 0.744107L12.1459 5.19893L15.4997 7.13381C15.8092 7.31241 15.9999 7.64262 15.9999 8C15.9999 8.35738 15.8092 8.6876 15.4997 8.86619L12.1459 10.8011L10.9667 15.2559C10.8505 15.6945 10.4537 16 9.99995 16C9.54622 16 9.14935 15.6945 9.03324 15.2559L7.85402 10.8011L4.50027 8.86618C4.19072 8.68759 4 8.35738 4 8C4 7.64262 4.19072 7.31241 4.50027 7.13382L7.85402 5.19893L9.03324 0.744107C9.14935 0.305483 9.54622 0 9.99995 0Z" fill="#FBBF24"/>
              </svg>
              '
            width={20}
            height={20}
          />
        }
      >
        <Text status="basic">Eu sunt text</Text>
      </SectionWrapper>
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
