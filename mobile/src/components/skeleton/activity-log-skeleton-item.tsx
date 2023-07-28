import React from 'react';
import ContentLoader, { Rect, Circle } from 'react-content-loader/native';

const ActivityLogSkeletonItem = (props: any) => (
  <ContentLoader
    speed={2}
    width={350}
    height={70}
    viewBox="0 0 350 70"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
    {...props}
  >
    <Rect x="63" y="19" rx="3" ry="3" width="88" height="8" />
    <Rect x="62" y="35" rx="3" ry="3" width="206" height="8" />
    <Circle cx="29" cy="31" r="22" />
  </ContentLoader>
);

export default ActivityLogSkeletonItem;
