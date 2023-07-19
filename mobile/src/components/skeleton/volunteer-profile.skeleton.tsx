import React from 'react';
import ContentLoader, { Rect, Circle } from 'react-content-loader/native';

const VolunteerProfileSkeleton = (props: any) => (
  <ContentLoader
    speed={2}
    width={350}
    height={400}
    viewBox="0 0 350 400"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
    {...props}
  >
    <Rect x="154" y="68" rx="3" ry="3" width="52" height="6" />
    <Rect x="579" y="154" rx="0" ry="0" width="73" height="25" />
    <Circle cx="71" cy="65" r="63" />
    <Rect x="152" y="43" rx="0" ry="0" width="119" height="6" />
    <Rect x="4" y="212" rx="0" ry="0" width="128" height="6" />
    <Rect x="2" y="225" rx="0" ry="0" width="361" height="8" />
    <Rect x="160" y="203" rx="0" ry="0" width="0" height="1" />
    <Rect x="4" y="255" rx="0" ry="0" width="128" height="6" />
    <Rect x="3" y="268" rx="0" ry="0" width="361" height="8" />
    <Rect x="162" y="292" rx="0" ry="0" width="0" height="1" />
    <Rect x="161" y="373" rx="0" ry="0" width="0" height="1" />
    <Rect x="153" y="80" rx="3" ry="3" width="52" height="6" />
    <Rect x="152" y="93" rx="3" ry="3" width="52" height="6" />
    <Rect x="5" y="295" rx="0" ry="0" width="128" height="6" />
    <Rect x="3" y="308" rx="0" ry="0" width="361" height="8" />
    <Rect x="161" y="286" rx="0" ry="0" width="0" height="1" />
    <Rect x="5" y="338" rx="0" ry="0" width="128" height="6" />
    <Rect x="4" y="351" rx="0" ry="0" width="361" height="8" />
    <Rect x="163" y="375" rx="0" ry="0" width="0" height="1" />
    <Rect x="5" y="374" rx="0" ry="0" width="128" height="6" />
    <Rect x="3" y="387" rx="0" ry="0" width="361" height="8" />
    <Rect x="161" y="365" rx="0" ry="0" width="0" height="1" />
    <Circle cx="18" cy="163" r="12" />
    <Rect x="3" y="187" rx="0" ry="0" width="99" height="9" />
    <Rect x="45" y="160" rx="0" ry="0" width="78" height="9" />
    <Rect x="134" y="190" rx="0" ry="0" width="0" height="1" />
  </ContentLoader>
);

export default VolunteerProfileSkeleton;
