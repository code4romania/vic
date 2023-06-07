import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Button, Divider, Icon, StyleService, Text, useStyleSheet } from '@ui-kitten/components';
import i18n from '../common/config/i18n';
import OrganizationIdentity from '../components/OrganizationIdentity';
import Tabs from '../components/Tabs';
import { ActivityLogsTabs } from '../common/constants/activity-logs-tabs';
import { View, VirtualizedList } from 'react-native';
import LogItem from '../components/LogItem';

interface ActivityLogItem {
  id: string;
  icon: string;
  activityName: string;
  date: string;
  eventName: string;
  hoursLogged: number;
}

const ActivityLogs = ({ navigation }: any) => {
  const styles = useStyleSheet(themedStyles);
  console.log('ActivityLogs');

  const getItem = (): ActivityLogItem => ({
    id: Math.random().toString(12).substring(0),
    icon: 'heart',
    activityName: 'Administrare documente de legatura',
    date: '12.02.2022',
    eventName: 'Haideti să sortam hainele verzi',
    hoursLogged: 254,
  });

  const getItemCount = (_data: unknown) => 50;

  const onAddActivityLogButtonPress = () => {
    navigation.navigate('add-activity-log');
  };

  const onTabPress = (id: string | number) => {
    console.log(id);
  };

  const onActivityLogPress = (id: string) => {
    console.log(`activity log ${id} pressed`);
    navigation.navigate('view-activity-log', { id });
  };

  return (
    <PageLayout title={i18n.t('activity_log:title')} onBackButtonPress={navigation.goBack}>
      <View style={styles.organizationIdentityWrapper}>
        <OrganizationIdentity uri="https://picsum.photos/200/300" name="Asociația ZEN" />
      </View>
      <Tabs tabs={ActivityLogsTabs} onPress={onTabPress} />
      <Text appearance="hint" style={styles.totalText}>
        {`${i18n.t('activity_log:total')}`} <Text category="p2">{`${235}h`} </Text>
      </Text>
      <VirtualizedList
        getItemCount={getItemCount}
        renderItem={({ item }: { item: ActivityLogItem }) => (
          <LogItem
            icon={item.icon}
            title={item.activityName}
            date={item.date}
            eventName={item.eventName}
            duration={item.hoursLogged}
            onPress={onActivityLogPress.bind(null, item.id)}
          />
        )}
        getItem={getItem}
        ItemSeparatorComponent={Divider}
      />
      <Button onPress={onAddActivityLogButtonPress} style={styles.addButton}>
        {() => <Icon name="plus" style={styles.addIcon} />}
      </Button>
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
