import React from 'react';
import ContentLoader, { Rect, Circle } from 'react-content-loader/native';

const ActivityLogSkeleton = (props: any) => (
  <ContentLoader
    speed={2}
    width={350}
    height={350}
    viewBox="0 0 350 350"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
    {...props}
  >
    <Rect x="41" y="59" rx="3" ry="3" width="88" height="8" />
    <Circle cx="19" cy="63" r="14" />
    <Rect x="6" y="98" rx="7" ry="7" width="94" height="6" />
    <Rect x="6" y="110" rx="7" ry="7" width="258" height="9" />
    <Rect x="6" y="138" rx="7" ry="7" width="94" height="6" />
    <Rect x="6" y="150" rx="7" ry="7" width="196" height="8" />
    <Rect x="8" y="176" rx="7" ry="7" width="94" height="6" />
    <Rect x="7" y="187" rx="7" ry="7" width="122" height="8" />
    <Rect x="8" y="215" rx="7" ry="7" width="94" height="6" />
    <Rect x="8" y="255" rx="7" ry="7" width="94" height="6" />
    <Rect x="7" y="267" rx="7" ry="7" width="258" height="9" />
    <Rect x="8" y="228" rx="7" ry="7" width="47" height="7" />
    <Rect x="7" y="292" rx="7" ry="7" width="94" height="6" />
    <Rect x="7" y="304" rx="7" ry="7" width="258" height="9" />
  </ContentLoader>
);

export default ActivityLogSkeleton;
