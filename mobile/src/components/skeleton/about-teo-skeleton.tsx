import React from 'react';
import ContentLoader, { Rect } from 'react-content-loader/native';

const AboutTeoSkeleton = (props: any) => (
  <ContentLoader
    speed={2}
    width={500}
    height={210}
    viewBox="0 0 500 210"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
    {...props}
  >
    <Rect x="6" y="12" rx="8" ry="8" width="101" height="9" />
    <Rect x="4" y="35" rx="8" ry="8" width="136" height="169" />
    <Rect x="154" y="35" rx="8" ry="8" width="136" height="170" />
  </ContentLoader>
);

export default AboutTeoSkeleton;
