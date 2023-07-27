import React from 'react';
import ContentLoader, { Rect, Circle } from 'react-content-loader/native';

const EventSkeletonListItem = (props: any) => (
  <ContentLoader
    speed={2}
    width={350}
    height={85}
    viewBox="0 0 350 85"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
    {...props}
  >
    <Rect x="66" y="11" rx="3" ry="3" width="88" height="6" />
    <Rect x="65" y="24" rx="3" ry="3" width="173" height="7" />
    <Circle cx="32" cy="34" r="22" />
    <Rect x="65" y="56" rx="3" ry="3" width="52" height="7" />
    <Rect x="66" y="40" rx="3" ry="3" width="115" height="7" />
  </ContentLoader>
);

export default EventSkeletonListItem;
