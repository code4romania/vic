import React from 'react';
import { Text, withStyles } from '@ui-kitten/components';

interface ParagraphProps {
  children: string;
  eva?: any;
}

const Paragraph = ({ children, eva }: ParagraphProps) => (
  <Text category="p1" style={eva?.style.paragraph}>
    {children}
  </Text>
);

export default withStyles(Paragraph, (theme) => ({
  paragraph: {
    color: theme['cool-gray-500'],
  },
}));
