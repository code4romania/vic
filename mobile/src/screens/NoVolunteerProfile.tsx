import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Layout, Text } from '@ui-kitten/components';
import Button from '../components/Button';
import SadFaceSvg from '../assets/svg/sad-face';
import { StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import i18n from '../common/config/i18n';
import { ButtonType } from '../common/enums/button-type.enum';

const NoVolunteerProfile = () => {
  console.log('No Volunteer Profile');

  const onAddOrganizationPress = () => {
    console.log('add organization pressed');
  };

  return (
    <PageLayout title="">
      <Layout style={styles.container}>
        <SvgXml xml={SadFaceSvg} style={styles.svg} />
        <Text category="h3" style={styles.noOrgAdded}>{`${i18n.t('general:no_org_added')}`}</Text>
        <Text style={styles.description}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Curabitur molestie vel lorem a
          varius. Praesent nisi libero, fermentum eu aliquet non, euismod eu arcu. Donec et ipsum ut
          ex efficitur tristique.
        </Text>
        <Button
          type={ButtonType.PRIMARY}
          label="Adaugă organizație"
          onPress={onAddOrganizationPress}
        />
      </Layout>
    </PageLayout>
  );
};

export default NoVolunteerProfile;

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {
    marginBottom: 50,
  },
  noOrgAdded: {
    marginBottom: 12,
  },
  description: {
    marginBottom: 28,
    textAlign: 'center',
  },
});
