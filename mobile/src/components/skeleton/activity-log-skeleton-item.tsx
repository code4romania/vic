import React from 'react';
import { Rect, Circle } from 'react-content-loader/native';
import ContentLoader from './SkeletonLoader';

const ActivityLogSkeletonItem = (props: any) => (
  <ContentLoader width={350} height={70} viewBox="0 0 350 70" {...props}>
    <Rect x="63" y="19" rx="3" ry="3" width="88" height="8" />
    <Rect x="62" y="35" rx="3" ry="3" width="206" height="8" />
    <Circle cx="29" cy="31" r="22" />
  </ContentLoader>
);

export default ActivityLogSkeletonItem;
