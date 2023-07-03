import React from 'react';
import ModalLayout from '../layouts/ModalLayout';
import OrganizationIdentity from '../components/OrganizationIdentity';
import { useOrganization } from '../store/organization/organization.selector';
import { Text } from '@ui-kitten/components';
import { StyleSheet, View } from 'react-native';

const LeaveOrganization = ({ navigation }: any) => {
  console.log('LeaveOrganization');

  const { organization } = useOrganization();

  return (
    <ModalLayout title="Leave Organization" onDismiss={navigation.goBack}>
      <View style={styles.container}>
        {organization && (
          <OrganizationIdentity uri={organization.logo || ''} name={organization.name} />
        )}
        <Text category="p1" style={styles.paragraph}>
          Daca parasesti organizatia, aceasta iti va sterge datele. Fugiat ipsum ipsum deserunt
          culpa aute sint do nostrud anim incididunt cillum culpa consequat. Excepteur qui ipsum
          aliquip consequat sint. Sit id mollit nulla mollit nostrud in ea officia proident. Irure
          nostrud pariatur mollit ad adipisicing reprehenderit deserunt qui eu.
        </Text>
      </View>
    </ModalLayout>
  );
};

export default LeaveOrganization;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
    flex: 1,
    gap: 16,
  },
  paragraph: {
    lineHeight: 24,
  },
});
