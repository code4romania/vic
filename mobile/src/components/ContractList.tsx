import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import ContractItem from './ContractItem';
import { IContractListItem } from '../common/interfaces/contract-list-item.interface';
import { ContractStatus } from '../common/enums/contract-status.enum';
import SectionWrapper from './SectionWrapper';
import { Divider } from '@ui-kitten/components';

interface ContractListProps {
  heading: string;
  contracts: IContractListItem[];
  status: ContractStatus;
  onContractItemPress: (contractId: string) => void;
}

const ContractList = ({ heading, status, onContractItemPress, contracts }: ContractListProps) => {
  // don't show the section if no data is displayed
  if (contracts.length === 0) {
    return <></>;
  }

  return (
    <SectionWrapper title={heading}>
      <View style={styles.container}>
        <FlatList
          bouncesZoom={false}
          alwaysBounceHorizontal={false}
          alwaysBounceVertical={false}
          bounces={false}
          showsVerticalScrollIndicator={false}
          data={contracts}
          renderItem={({ item }: { item: IContractListItem }) => (
            <ContractItem
              id={item.id}
              title={item.contractNumber}
              status={status}
              startDate={item.startDate}
              endDate={item.endDate}
              onPress={onContractItemPress.bind(null, item.id)}
            />
          )}
          ItemSeparatorComponent={Divider}
        />
      </View>
    </SectionWrapper>
  );
};

export default ContractList;

const styles = StyleSheet.create({
  container: {
    maxHeight: 244, // equivalent with 3 items + divider
    marginBottom: 16,
  },
});
