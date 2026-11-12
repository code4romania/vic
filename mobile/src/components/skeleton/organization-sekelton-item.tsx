import React from 'react';
import { Rect, Circle } from 'react-content-loader/native';
import ContentLoader from './SkeletonLoader';

const OrganizationSkeletonListItem = (props: any) => (
  <ContentLoader width={350} height={70} viewBox="0 0 350 70" {...props}>
    <Rect x="65" y="26" rx="3" ry="3" width="52" height="6" />
    <Rect x="65" y="11" rx="0" ry="0" width="119" height="6" />
    <Circle cx="30" cy="30" r="25" />
  </ContentLoader>
);

export default OrganizationSkeletonListItem;
