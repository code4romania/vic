import React from 'react';
import { Layout, Text } from '@ui-kitten/components';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/Button';
import { Button as KittenButton } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';
import { ButtonType } from '../common/enums/button-type.enum';

const Home = ({ navigation }: any) => {
  console.log('Home');
  const { logout } = useAuth();

  const onViewNewsButtonPress = () => {
    navigation.navigate('news');
  };

  return (
    <Layout style={styles.layout}>
      <Text category="h1">Dashboard</Text>
      <KittenButton onPress={logout}>logout</KittenButton>
      <Button onPress={onViewNewsButtonPress} label="View News" type={ButtonType.DANGER} />
    </Layout>
  );
};

export default Home;

const styles = StyleSheet.create({
  layout: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
