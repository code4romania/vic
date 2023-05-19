import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { StyleService, Text, useStyleSheet } from '@ui-kitten/components';
import i18n from '../common/config/i18n';
import ProfileIntro from '../components/ProfileIntro';
import { ScrollView, View } from 'react-native';
import ReadOnlyElement from '../components/ReadOnlyElement';
import { formatDate } from '../common/utils/utils';
import OrganizationIdentity from '../components/OrganizationIdentity';

const volunteer = {
  logo: 'https://picsum.photos/200',
  name: 'Andreea Popa',
  age: 23,
  sex: 'female',
  county: 'Iasi',
  city: 'Aroneanu',
  email: 'anamaria@gmail.com',
  phone: '0758996987',
  role: 'Community manager',
  department: 'PR și Comunicare',
  branch: 'margotfoster@example.com',
  createdOn: new Date(),
  activeSince: new Date(2012, 5, 3),
  organization: {
    name: 'Asociatia ZEN',
    logo: 'https://picsum.photos/200',
  },
};

const VolunteerProfile = ({ navigation }: any) => {
  console.log('VolunteerProfile');
  const styles = useStyleSheet(themedStyles);

  const onEditVolunteerProfileButtonPress = () => {
    navigation.navigate('edit-volunteer');
  };

  return (
    <PageLayout
      title={i18n.t('volunteer:profile')}
      onBackButtonPress={navigation.goBack}
      onEditButtonPress={onEditVolunteerProfileButtonPress}
    >
      <ScrollView>
        <ProfileIntro
          uri={volunteer.logo}
          name={volunteer.name}
          description={`${i18n.t('volunteer:age', { years: volunteer.age })}\n${i18n.t(
            'general:sex',
            { sex_type: i18n.t(`general:${volunteer.sex}`) },
          )}\n${volunteer.city}${i18n.t('volunteer:county', { name: volunteer.county })}`}
        />
        <View style={styles.profileContent}>
          <OrganizationIdentity
            uri={volunteer.organization.logo}
            name={volunteer.organization.name}
          />
          <Text category="p2">{`${i18n.t('volunteer:information')}`}</Text>
          <ReadOnlyElement label={i18n.t('volunteer:email')} value={volunteer.email} />
          <ReadOnlyElement label={i18n.t('general:phone')} value={volunteer.phone} />
          <ReadOnlyElement label={i18n.t('general:role')} value={volunteer.role} />
          <ReadOnlyElement label={i18n.t('general:department')} value={volunteer.department} />
          <ReadOnlyElement label={i18n.t('general:branch')} value={volunteer.branch} />
          <ReadOnlyElement
            label={i18n.t('volunteer:active_since')}
            value={formatDate(volunteer.activeSince)}
          />
          <ReadOnlyElement
            label={i18n.t('volunteer:created_on')}
            value={formatDate(volunteer.createdOn)}
          />
        </View>
      </ScrollView>
    </PageLayout>
  );
};

export default VolunteerProfile;

const themedStyles = StyleService.create({
  profileContent: {
    marginTop: 32,
    gap: 16,
  },
});
