import React from 'react';
import ContentLoader, { Rect, Circle } from 'react-content-loader/native';

const EventSkeleton = (props: any) => (
  <ContentLoader
    speed={2}
    width={350}
    height={550}
    viewBox="0 0 350 550"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
    {...props}
  >
    <Rect x="1" y="4" rx="19" ry="19" width="345" height="204" />
    <Circle cx="19" cy="236" r="15" />
    <Rect x="43" y="231" rx="0" ry="0" width="101" height="11" />
    <Rect x="3" y="272" rx="0" ry="0" width="130" height="10" />
    <Rect x="3" y="289" rx="0" ry="0" width="335" height="10" />
    <Rect x="2" y="323" rx="0" ry="0" width="130" height="10" />
    <Rect x="2" y="339" rx="0" ry="0" width="335" height="10" />
    <Rect x="5" y="372" rx="0" ry="0" width="130" height="10" />
    <Rect x="5" y="389" rx="0" ry="0" width="332" height="10" />
    <Rect x="4" y="418" rx="0" ry="0" width="130" height="10" />
    <Rect x="5" y="435" rx="0" ry="0" width="332" height="10" />
    <Rect x="8" y="468" rx="0" ry="0" width="130" height="10" />
    <Rect x="8" y="485" rx="0" ry="0" width="332" height="10" />
    <Rect x="7" y="514" rx="0" ry="0" width="130" height="10" />
    <Rect x="8" y="531" rx="0" ry="0" width="332" height="10" />
  </ContentLoader>
);

export default EventSkeleton;
