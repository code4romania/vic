import { Icon, Text, withStyles } from '@ui-kitten/components';
import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { formatDate } from '../common/utils/utils';
import PressableContainer from './PressableContainer';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';
import { useTranslation } from 'react-i18next';

interface ContractItemProps {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  leftIcon: ReactNode;
  rightIconName?: string;
  info?: string;
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
  info,
}: ContractItemProps) => {
  const { t } = useTranslation('documents');

  const onContractPress = () => {
    onPress(id);
  };

  return (
    <PressableContainer onPress={onContractPress}>
      <View style={eva.style.container}>
        {leftIcon}
        <View style={eva.style.textWrapper}>
          <Text
            allowFontScaling={ALLOW_FONT_SCALLING}
            category="p2"
            ellipsizeMode="tail"
            numberOfLines={1}
          >
            {`${t('contract_prefix')} ${title}`}
          </Text>
          <View style={eva?.style.subtitleWrapper}>
            <Text
              category="c1"
              appearance="hint"
              ellipsizeMode="tail"
              numberOfLines={1}
            >{`${formatDate(startDate)} - ${formatDate(endDate)}`}</Text>
            {info && (
              <Text category="c1" appearance="hint" ellipsizeMode="tail" numberOfLines={1}>
                ({info})
              </Text>
            )}
          </View>
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
  subtitleWrapper: {
    flexDirection: 'row',
    gap: 2,
  },
}));
