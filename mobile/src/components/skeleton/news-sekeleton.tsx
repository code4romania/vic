import React from 'react';
import ContentLoader, { Rect } from 'react-content-loader/native';

const NewsSkeleton = (props: any) => (
  <ContentLoader
    speed={2}
    width={500}
    height={210}
    viewBox="0 0 500 210"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
    {...props}
  >
    <Rect x="6" y="12" rx="8" ry="8" width="159" height="12" />
    <Rect x="5" y="49" rx="6" ry="6" width="357" height="67" />
    <Rect x="7" y="134" rx="6" ry="6" width="357" height="67" />
  </ContentLoader>
);

export default NewsSkeleton;
