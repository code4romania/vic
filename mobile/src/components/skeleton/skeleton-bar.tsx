import React from 'react';
import ContentLoader, { Rect } from 'react-content-loader/native';

const SkeletonBar = (props: any) => (
  <ContentLoader
    speed={2}
    width={350}
    height={10}
    viewBox="0 0 350 10"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
    {...props}
  >
    <Rect x="579" y="154" rx="0" ry="0" width="73" height="25" />
    <Rect x="2" y="1" rx="0" ry="0" width="129" height="9" />
    <Rect x="72" y="21" rx="0" ry="0" width="0" height="1" />
  </ContentLoader>
);

export default SkeletonBar;
