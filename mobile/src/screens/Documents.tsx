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
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('documents');

  const onContractPress = (id: string) => {
    console.log('contract pressed', id);
  };

  const onPendingContractPress = (id: string) => {
    navigation.navigate('contract', { id });
  };

  return (
    <PageLayout onBackButtonPress={navigation.goBack} title={t('general:documents')}>
      <View style={styles.container}>
        <OrganizationIdentity name="Asociația ZEN" uri="https://picsum.photos/200" />
        <Text>{`${t('description')}`}</Text>
        <SectionList
          sections={Data}
          renderItem={({ item }: { item: IContractListItem }) => (
            <ContractItem
              id={item.id}
              title={item.name}
              status={item.status}
              startDate={item.startDate}
              endDate={item.endDate}
              iconRightName={item.status === ContractStatus.PENDING ? 'chevron-right' : 'download'}
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
