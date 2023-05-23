import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button, Icon, StyleService, Text, useStyleSheet } from '@ui-kitten/components';
import i18n from '../common/config/i18n';
import OrganizationIdentity from '../components/OrganizationIdentity';
import Tabs from '../components/Tabs';
import { ActivityLogsTabs } from '../common/constants/activity-logs-tabs';
import { View } from 'react-native';

const ActivityLogs = ({ navigation }: any) => {
  const styles = useStyleSheet(themedStyles);
  console.log('ActivityLogs');

  const onAddActivityLogButtonPress = () => {
    navigation.navigate('add-activity-log');
  };

  const onViewActivityLogButtonPress = () => {
    navigation.navigate('view-activity-log');
  };

  const onTabPress = (id: string | number) => {
    console.log(id);
  };

  return (
    <PageLayout title={i18n.t('activity_log:title')} onBackButtonPress={navigation.goBack}>
      <View style={styles.organizationIdentityWrapper}>
        <OrganizationIdentity uri="https://picsum.photos/200/300" name="Asociația ZEN" />
      </View>
      <Tabs tabs={ActivityLogsTabs} onPress={onTabPress}>
        <Text appearance="hint" style={styles.totalText}>
          {`${i18n.t('activity_log:total')}`} <Text category="p2">{`${235}h`} </Text>
        </Text>
      </Tabs>
      <Button onPress={onAddActivityLogButtonPress} style={styles.addButton}>
        {() => <Icon name="plus" style={styles.addIcon} />}
      </Button>
      <Button onPress={onViewActivityLogButtonPress}>View</Button>
    </PageLayout>
  );
};

export default ActivityLogs;

const themedStyles = StyleService.create({
  totalText: {
    textAlign: 'right',
  },
  organizationIdentityWrapper: {
    marginBottom: 21,
  },
  addButton: {
    position: 'absolute',
    right: 21,
    bottom: 21,
    width: 48,
    height: 48,
    borderRadius: 24,
    paddingHorizontal: 0,
    paddingVertical: 0,
  },
  addIcon: {
    height: 24,
    color: '$color-basic-100',
  },
});
