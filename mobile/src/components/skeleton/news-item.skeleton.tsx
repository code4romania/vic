import React from 'react';
import ContentLoader, { Rect } from 'react-content-loader/native';

const NewsItemSkeleton = (props: any) => (
  <ContentLoader
    speed={2}
    width={350}
    height={85}
    viewBox="0 0 350 85"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
    {...props}
  >
    <Rect x="2" y="2" rx="6" ry="6" width="342" height="75" />
  </ContentLoader>
);

export default NewsItemSkeleton;
