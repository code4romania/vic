// Skeleton „Îndrăzneț”: sand shapes (#E4DFD2) on paper with a slow, lighter shimmer.
// Reduce Motion: the shapes stay still.
import React from 'react';
import ContentLoader, { IContentLoaderProps } from 'react-content-loader/native';
import { useReducedMotion } from 'react-native-reanimated';
import { palette } from '../../design/tokens';

/** the shimmer that passes over the sand shapes */
export const SKELETON_SHINE = '#EEEAE0';

const SkeletonLoader = ({ children, ...props }: IContentLoaderProps) => {
  const reduced = useReducedMotion();
  return (
    <ContentLoader
      speed={1.4}
      {...props}
      backgroundColor={palette.sand}
      foregroundColor={SKELETON_SHINE}
      animate={!reduced}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {children}
    </ContentLoader>
  );
};

export default SkeletonLoader;
