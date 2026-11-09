import React from 'react';
import { useTheme } from '@ui-kitten/components';
import GrayIcon from './GreyIcon';

// legacy file icon, still used by the contract signing page
export const DocumentIcon = ({
  color,
  backgroundColor,
}: {
  backgroundColor?: string;
  color?: string;
}) => {
  const theme = useTheme();
  return (
    <GrayIcon
      name={'file-text'}
      backgroundColor={backgroundColor}
      style={{
        color: theme[color || 'gray-50'],
      }}
    />
  );
};

export default DocumentIcon;
