import React from 'react';
import PageLayout from '../layouts/PageLayout';
import { Divider, Text } from '@ui-kitten/components';
import OrganizationIdentity from '../components/OrganizationIdentity';
import i18n from '../common/config/i18n';
import { StyleSheet } from 'react-native';
import ContractItem from '../components/ContractItem';
import { ContractStatus } from '../common/enums/contract.status.enum';
import { IContractListItem } from '../common/interfaces/contract.interface';
import { View } from 'react-native';
import { SectionList } from 'react-native';

const Data = [
  {
    title: i18n.t('documents:contracts_proposal'),
    data: [
      {
        id: '1',
        name: 'Contract 1',
        status: ContractStatus.PENDING,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      },
      {
        id: '2',
        name: 'Contract 2',
        status: ContractStatus.PENDING,
        startDate: new Date('2023-02-01'),
        endDate: new Date('2023-06-30'),
      },
      {
        id: '3',
        name: 'Contract 3',
        status: ContractStatus.PENDING,
        startDate: new Date('2023-03-01'),
        endDate: new Date('2023-03-31'),
      },
    ],
  },
  {
    title: i18n.t('documents:contracts_history'),
    data: [
      {
        id: '123',
        name: 'Contract 12312',
        status: ContractStatus.ACTIVE,
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31'),
      },
      {
        id: '1234',
        name: 'Contract 123123',
        status: ContractStatus.CLOSED,
        startDate: new Date('2023-02-01'),
        endDate: new Date('2023-06-30'),
      },
      {
        id: '1435',
        name: 'Contract 123123123',
        status: ContractStatus.CLOSED,
        startDate: new Date('2023-03-01'),
        endDate: new Date('2023-03-31'),
      },
    ],
  },
];

const Documents = ({ navigation }: any) => {
  const onContractPress = () => {
    console.log('contract pressed');
  };

  const onPendingContractPress = () => {
    console.log('pending contract pressed');
  };

  return (
    <PageLayout onBackButtonPress={navigation.goBack} title={i18n.t('general:documents')}>
      <View style={styles.container}>
        <OrganizationIdentity name="Asociația ZEN" uri="https://picsum.photos/200" />
        <Text>{`${i18n.t('documents:description')}`}</Text>
        <SectionList
          sections={Data}
          renderItem={({ item }: { item: IContractListItem }) => (
            <ContractItem
              title={item.name}
              status={item.status}
              startDate={item.startDate}
              endDate={item.endDate}
              onPress={
                item.status === ContractStatus.PENDING ? onPendingContractPress : onContractPress
              }
            />
          )}
          renderSectionHeader={({ section: { title } }) => (
            <Text category="p2" style={styles.sectionTitle}>
              {title}
            </Text>
          )}
          ItemSeparatorComponent={Divider}
        />
      </View>
    </PageLayout>
  );
};

export default Documents;

const styles = StyleSheet.create({
  sectionTitle: {
    paddingTop: 16,
  },
  container: {
    gap: 16,
  },
});
