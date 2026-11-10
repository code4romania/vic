import React from 'react';
import { TextStyle } from 'react-native';
import { VText } from './ui';

interface ParagraphProps {
  children: string;
  style?: TextStyle;
}

/** Secondary body text (VIC 2.0 `sub`). */
const Paragraph = ({ children, style }: ParagraphProps) => (
  <VText variant="sub" style={style}>
    {children}
  </VText>
);

export default Paragraph;
