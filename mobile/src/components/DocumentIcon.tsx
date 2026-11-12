import React from 'react';
import GrayIcon from './GreyIcon';
import { DocumentIcon as FileIcon } from '../design/icons';

// legacy file icon, still used by the contract signing page
export const DocumentIcon = ({
  color,
  backgroundColor,
}: {
  backgroundColor?: string;
  color?: string;
}) => <GrayIcon icon={FileIcon} color={color} backgroundColor={backgroundColor} />;

export default DocumentIcon;
