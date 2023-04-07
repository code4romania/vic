import React from 'react';
import { Layout, Text } from '@ui-kitten/components';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@ui-kitten/components';
import { StyleSheet } from 'react-native';

const Home = ({ navigation }: any) => {
  console.log('Home');
  const { logout } = useAuth();

  const onViewNewsButtonPress = () => {
    navigation.navigate('news');
  };

  return (
    <Layout style={styles.layout}>
      <Text category="h1">Dashboard</Text>
      <Button onPress={logout}>logout</Button>
      <Button onPress={onViewNewsButtonPress}>View News</Button>
    </Layout>
  );
};

export default Home;

const styles = StyleSheet.create({
  layout: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
