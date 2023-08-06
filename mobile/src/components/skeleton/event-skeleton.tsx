import React from 'react';
import ContentLoader, { Rect, Circle } from 'react-content-loader/native';

const EventSkeleton = (props: any) => (
  <ContentLoader
    speed={2}
    width={350}
    height={500}
    viewBox="0 0 350 500"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
    {...props}
  >
    <Circle cx="23" cy="24" r="18" />
    <Rect x="49" y="19" rx="6" ry="6" width="138" height="10" />
    <Rect x="6" y="76" rx="6" ry="6" width="170" height="9" />
    <Rect x="5" y="93" rx="6" ry="6" width="300" height="11" />
    <Rect x="5" y="124" rx="6" ry="6" width="170" height="9" />
    <Rect x="4" y="141" rx="6" ry="6" width="300" height="11" />
    <Rect x="6" y="172" rx="6" ry="6" width="170" height="9" />
    <Rect x="5" y="189" rx="6" ry="6" width="300" height="11" />
    <Rect x="5" y="220" rx="6" ry="6" width="170" height="9" />
    <Rect x="4" y="237" rx="6" ry="6" width="300" height="11" />
    <Rect x="6" y="264" rx="6" ry="6" width="170" height="9" />
    <Rect x="5" y="281" rx="6" ry="6" width="300" height="11" />
    <Rect x="5" y="312" rx="6" ry="6" width="170" height="9" />
    <Rect x="4" y="329" rx="6" ry="6" width="300" height="11" />
    <Rect x="6" y="360" rx="6" ry="6" width="170" height="9" />
    <Rect x="5" y="377" rx="6" ry="6" width="300" height="11" />
    <Rect x="5" y="408" rx="6" ry="6" width="170" height="9" />
    <Rect x="4" y="425" rx="6" ry="6" width="300" height="11" />
  </ContentLoader>
);

export default EventSkeleton;
