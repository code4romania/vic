import React from 'react';
import { FlatList, View, StyleSheet } from 'react-native';
import ContractItem from './ContractItem';
import { IContractListItem } from '../common/interfaces/contract-list-item.interface';
import { ContractStatus } from '../common/enums/contract-status.enum';
import SectionWrapper from './SectionWrapper';
import { Divider, useTheme } from '@ui-kitten/components';
import GrayIcon from './GreyIcon';

interface ContractListProps {
  heading: string;
  contracts: IContractListItem[];
  onContractItemPress: (contractId: string) => void;
}

export const PendingContractIcon = () => {
  const theme = useTheme();
  return (
    <GrayIcon
      name={'file-text'}
      style={{
        color: theme['yellow-500'],
      }}
    />
  );
};

export const CloseContractIcon = () => {
  const theme = useTheme();
  return (
    <GrayIcon
      name={'file-text'}
      style={{
        color: theme['yellow-500'],
      }}
    />
  );
};

const ContractList = ({ heading, onContractItemPress, contracts }: ContractListProps) => {
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
              leftIcon={
                item.status !== ContractStatus.PENDING_VOLUNTEER ? (
                  <PendingContractIcon />
                ) : (
                  <CloseContractIcon />
                )
              }
              startDate={item.startDate}
              endDate={item.endDate}
              rightIconName={
                item.status === ContractStatus.PENDING_VOLUNTEER ? 'chevron-right' : 'download'
              }
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
