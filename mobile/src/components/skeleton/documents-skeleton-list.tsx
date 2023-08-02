import React from 'react';
import ContentLoader, { Rect, Circle } from 'react-content-loader/native';

const DocumentSkeletonList = (props: any) => (
  <ContentLoader
    speed={2}
    width={350}
    height={500}
    viewBox="0 0 350 500"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
    {...props}
  >
    <Rect x="5" y="20" rx="8" ry="8" width="150" height="12" />
    <Circle cx="27" cy="91" r="22" />
    <Rect x="62" y="80" rx="8" ry="8" width="99" height="8" />
    <Rect x="61" y="98" rx="8" ry="8" width="135" height="7" />
    <Circle cx="28" cy="150" r="22" />
    <Rect x="63" y="139" rx="8" ry="8" width="99" height="8" />
    <Rect x="62" y="157" rx="8" ry="8" width="135" height="7" />
    <Circle cx="28" cy="210" r="22" />
    <Rect x="63" y="199" rx="8" ry="8" width="99" height="8" />
    <Rect x="62" y="217" rx="8" ry="8" width="135" height="7" />
    <Rect x="8" y="259" rx="8" ry="8" width="150" height="12" />
    <Circle cx="30" cy="330" r="22" />
    <Rect x="65" y="319" rx="8" ry="8" width="99" height="8" />
    <Rect x="64" y="337" rx="8" ry="8" width="135" height="7" />
    <Circle cx="31" cy="389" r="22" />
    <Rect x="66" y="378" rx="8" ry="8" width="99" height="8" />
    <Rect x="65" y="396" rx="8" ry="8" width="135" height="7" />
    <Circle cx="31" cy="449" r="22" />
    <Rect x="66" y="438" rx="8" ry="8" width="99" height="8" />
    <Rect x="65" y="456" rx="8" ry="8" width="135" height="7" />
  </ContentLoader>
);

export default DocumentSkeletonList;
