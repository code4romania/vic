import React from 'react';
import { Rect } from 'react-content-loader/native';
import ContentLoader from './SkeletonLoader';

const NewsItemSkeleton = (props: any) => (
  <ContentLoader width={350} height={85} viewBox="0 0 350 85" {...props}>
    <Rect x="2" y="2" rx="6" ry="6" width="342" height="75" />
  </ContentLoader>
);

export default NewsItemSkeleton;
