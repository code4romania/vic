import { Icon, Text, withStyles } from '@ui-kitten/components';
import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { formatDate } from '../common/utils/utils';
import PressableContainer from './PressableContainer';

interface ContractItemProps {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  leftIcon: ReactNode;
  rightIconName?: string;
  onPress: (id: string) => void;
  eva?: any;
}

const ContractItem = ({
  id,
  title,
  startDate,
  endDate,
  rightIconName = 'download',
  onPress,
  eva,
  leftIcon,
}: ContractItemProps) => {
  const onContractPress = () => {
    onPress(id);
  };

  return (
    <PressableContainer onPress={onContractPress}>
      <View style={eva.style.container}>
        {leftIcon}
        <View style={eva.style.textWrapper}>
          <Text category="p2" ellipsizeMode="tail" numberOfLines={1}>
            {title}
          </Text>
          <Text
            category="c1"
            appearance="hint"
            ellipsizeMode="tail"
            numberOfLines={1}
          >{`${formatDate(startDate)} - ${formatDate(endDate)}`}</Text>
        </View>
        <View style={eva.style.iconWrapper}>
          <Icon name={rightIconName} style={eva.style.icon} />
        </View>
      </View>
    </PressableContainer>
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
