import React from 'react';
import { Rect } from 'react-content-loader/native';
import ContentLoader from './SkeletonLoader';

const AboutVicSkeleton = (props: any) => (
  <ContentLoader width={500} height={210} viewBox="0 0 500 210" {...props}>
    <Rect x="6" y="12" rx="8" ry="8" width="101" height="9" />
    <Rect x="4" y="35" rx="8" ry="8" width="136" height="169" />
    <Rect x="154" y="35" rx="8" ry="8" width="136" height="170" />
  </ContentLoader>
);

export default AboutVicSkeleton;
