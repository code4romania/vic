import React from 'react';
import { StyleService, Text, useStyleSheet } from '@ui-kitten/components';
import { View } from 'react-native';
import { ALLOW_FONT_SCALLING } from '../common/constants/constants';

interface TaskPill {
  label: string;
}

const TaskPill = ({ label }: TaskPill) => {
  const styles = useStyleSheet(themedStyles);

  return (
    <View style={styles.container}>
      <Text allowFontScaling={ALLOW_FONT_SCALLING}>{label}</Text>
    </View>
  );
};

export default TaskPill;

const themedStyles = StyleService.create({
  container: {
    height: 32,
    backgroundColor: '$cool-gray-100',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: 50,
  },
});
