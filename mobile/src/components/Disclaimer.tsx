import React from 'react';
import { Text, withStyles } from '@ui-kitten/components';
import { View } from 'react-native';

interface DisclaimerProps {
  color: string;
  text: string;
  eva?: any;
}

const Disclaimer = ({ color, text, eva }: DisclaimerProps) => {
  return (
    <View style={[eva.style.container, { backgroundColor: eva.theme[`${color}-50`] }]}>
      <View style={[eva.style.dot, { backgroundColor: eva.theme[`${color}-500`] }]} />
      <Text category="c1" appearance="hint">
        {text}
      </Text>
    </View>
  );
};

export default withStyles(Disclaimer, () => ({
  container: {
    paddingVertical: 10,
    marginHorizontal: -16,
    paddingLeft: 16,
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 8,
  },
}));
