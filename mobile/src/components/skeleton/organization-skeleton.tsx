import React from 'react';
import ContentLoader, { Rect, Circle } from 'react-content-loader/native';

const OrganizationSkeleton = (props: any) => (
  <ContentLoader
    speed={2}
    width={350}
    height={400}
    viewBox="0 0 350 400"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
    {...props}
  >
    <Rect x="153" y="76" rx="3" ry="3" width="52" height="6" />
    <Rect x="579" y="154" rx="0" ry="0" width="73" height="25" />
    <Circle cx="71" cy="65" r="63" />
    <Rect x="152" y="43" rx="0" ry="0" width="119" height="6" />
    <Rect x="5" y="168" rx="0" ry="0" width="128" height="6" />
    <Rect x="4" y="183" rx="0" ry="0" width="361" height="8" />
    <Rect x="163" y="207" rx="0" ry="0" width="0" height="1" />
    <Rect x="4" y="199" rx="0" ry="0" width="361" height="8" />
    <Rect x="5" y="214" rx="0" ry="0" width="361" height="8" />
    <Rect x="7" y="257" rx="0" ry="0" width="128" height="6" />
    <Rect x="6" y="272" rx="0" ry="0" width="361" height="8" />
    <Rect x="165" y="296" rx="0" ry="0" width="0" height="1" />
    <Rect x="6" y="288" rx="0" ry="0" width="361" height="8" />
    <Rect x="6" y="338" rx="0" ry="0" width="128" height="6" />
    <Rect x="5" y="353" rx="0" ry="0" width="361" height="8" />
    <Rect x="164" y="377" rx="0" ry="0" width="0" height="1" />
    <Rect x="5" y="369" rx="0" ry="0" width="361" height="8" />
  </ContentLoader>
);

export default OrganizationSkeleton;
