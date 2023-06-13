import { Icon, Text, withStyles } from '@ui-kitten/components';
import React from 'react';
import { View } from 'react-native';
import { Pressable } from 'react-native';
import GrayIcon from './GreyIcon';
import { formatDate } from '../common/utils/utils';
import { ContractStatus } from '../common/enums/contract.status.enum';
import { useTranslation } from 'react-i18next';

interface ContractItemProps {
  id: string;
  title: string;
  status: ContractStatus;
  startDate: Date;
  endDate: Date;
  iconRightName: string;
  onPress: (id: string) => void;
  eva?: any;
}

const ContractItem = ({
  id,
  title,
  status,
  startDate,
  endDate,
  iconRightName,
  onPress,
  eva,
}: ContractItemProps) => {
  const { t } = useTranslation('documents');

  const onContractPress = () => {
    onPress(id);
  };

  return (
    <Pressable
      onPress={onContractPress}
      style={({ pressed }) =>
        pressed
          ? { backgroundColor: eva.theme['cool-gray-50'] }
          : { backgroundColor: eva.theme['cool-basic-100'] }
      }
    >
      <View style={eva.style.container}>
        <GrayIcon
          name={'file-text'}
          style={{
            color:
              status === ContractStatus.PENDING
                ? eva.theme['yellow-500']
                : eva.theme['cool-gray-500'],
          }}
        />
        <View style={eva.style.textWrapper}>
          <Text category="p2" ellipsizeMode="tail" numberOfLines={1}>
            {title}
          </Text>
          <Text
            category="c1"
            appearance="hint"
            ellipsizeMode="tail"
            numberOfLines={1}
          >{`${formatDate(startDate)} - ${formatDate(endDate)} ${
            status === ContractStatus.PENDING ? '' : `(${t(`contract_status.${status}`)})`
          }`}</Text>
        </View>
        <View style={eva.style.iconWrapper}>
          <Icon name={iconRightName} style={eva.style.icon} />
        </View>
      </View>
    </Pressable>
  );
};

export default withStyles(ContractItem, () => ({
  container: {
    paddingVertical: 16,
    gap: 16,
    flexDirection: 'row',
    alignContent: 'stretch',
    alignItems: 'center',
  },
  textWrapper: {
    flexShrink: 2,
  },
  iconWrapper: {
    marginLeft: 'auto',
  },
  icon: {
    height: 24,
  },
}));
