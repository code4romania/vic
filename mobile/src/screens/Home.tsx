import React from 'react';
import ScrollViewLayout from '../layouts/ScrollViewLayout';
import Statistics from '../components/Statistics';
import LatestNews from '../components/LatestNews';
import AboutTeo from '../components/AboutTeo';

const Home = ({ navigation }: any) => {
  return (
    <ScrollViewLayout>
      <Statistics />
      <LatestNews navigation={navigation} />
      <AboutTeo />
    </ScrollViewLayout>
  );
};

export default Home;
