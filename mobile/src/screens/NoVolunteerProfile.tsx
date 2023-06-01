import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Layout, Text } from '@ui-kitten/components';
import Button from '../components/Button';
import SadFaceSvg from '../assets/svg/sad-face';
import { StyleSheet } from 'react-native';
import { SvgXml } from 'react-native-svg';
import i18n from '../common/config/i18n';

const NoVolunteerProfile = () => {
  console.log('No Volunteer Profile');

  const onAddOrganizationPress = () => {
    console.log('add organization pressed');
  };

  return (
    <PageLayout title="">
      <Layout style={styles.container}>
        <SvgXml xml={SadFaceSvg} style={styles.svg} />
        <Text category="h3" style={styles.noOrgAdded}>{`${i18n.t('volunteer:no_org_added')}`}</Text>
        <Text style={styles.description} appearance="hint">{`${i18n.t(
          'volunteer:no_org_description',
        )}`}</Text>
        <Button
          label={i18n.t('general:add', { item: i18n.t('general:organization').toLowerCase() })}
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
