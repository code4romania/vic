import React, { useEffect } from 'react';
import ScrollViewLayout from '../layouts/ScrollViewLayout';
import Statistics from '../components/Statistics';
import LatestNews from '../components/LatestNews';
import AboutTeo from '../components/AboutTeo';
import { Auth } from 'aws-amplify';

const Home = ({ navigation }: any) => {
  useEffect(() => {
    (async () => {
      const user = await Auth.currentAuthenticatedUser();

      if (user?.getSignInUserSession()) {
        const token = `Bearer ${user.getSignInUserSession().getAccessToken().getJwtToken()}`;

        console.log('token', token);
      }
    })();
  }, []);

  return (
    <ScrollViewLayout>
      <Statistics />
      <LatestNews navigation={navigation} />
      <AboutTeo />
    </ScrollViewLayout>
  );
};

export default Home;
