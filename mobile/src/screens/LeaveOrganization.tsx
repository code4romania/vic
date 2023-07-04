import React from 'react';
import ModalLayout from '../layouts/ModalLayout';
import OrganizationIdentity from '../components/OrganizationIdentity';
import { useOrganization } from '../store/organization/organization.selector';
import { Text } from '@ui-kitten/components';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ButtonType } from '../common/enums/button-type.enum';
import useStore from '../store/store';

const LeaveOrganization = ({ navigation }: any) => {
  console.log('LeaveOrganization');
  const { t } = useTranslation('leave_ngo');

  const { open: openBottomSheet } = useStore();

  const { organization } = useOrganization();

  const onLeaveOrganization = () => {
    navigation.goBack();
    openBottomSheet();
  };

  return (
    <ModalLayout
      title={t('header')}
      actionsOptions={{
        buttonType: ButtonType.DANGER,
        onActionButtonClick: onLeaveOrganization,
        actionLabel: `${t('action_btn')}`,
      }}
      onDismiss={navigation.goBack}
    >
      <View style={styles.container}>
        {organization && (
          <OrganizationIdentity uri={organization.logo || ''} name={organization.name} />
        )}
        <Text category="p1" style={styles.paragraph}>
          {`${t('paragraph')}`}
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
