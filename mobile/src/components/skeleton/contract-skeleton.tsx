import React from 'react';
import ContentLoader, { Rect, Circle } from 'react-content-loader/native';

const ContractSkeleton = (props: any) => (
  <ContentLoader
    speed={2}
    width={350}
    height={500}
    viewBox="0 0 350 500"
    backgroundColor="#f3f3f3"
    foregroundColor="#ecebeb"
    {...props}
  >
    <Circle cx="22" cy="65" r="16" />
    <Rect x="42" y="62" rx="8" ry="8" width="95" height="10" />
    <Rect x="9" y="114" rx="8" ry="8" width="287" height="11" />
    <Rect x="9" y="134" rx="8" ry="8" width="287" height="12" />
    <Rect x="9" y="156" rx="8" ry="8" width="170" height="12" />
    <Circle cx="28" cy="230" r="24" />
    <Rect x="58" y="218" rx="8" ry="8" width="106" height="11" />
    <Rect x="56" y="235" rx="8" ry="8" width="185" height="12" />
  </ContentLoader>
);

export default ContractSkeleton;
