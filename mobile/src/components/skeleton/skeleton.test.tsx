import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { Rect } from 'react-content-loader/native';
import SkeletonLoader, { SKELETON_SHINE } from './SkeletonLoader';
import { palette } from '../../design/tokens';

let mockReduced = false;
jest.mock('react-native-reanimated', () => ({
  ...require('react-native-reanimated/mock'),
  useReducedMotion: () => mockReduced,
}));
jest.mock('react-content-loader/native', () => {
  const { View } = require('react-native');
  const ContentLoader = (props: any) => <View testID="loader" {...props} />;
  return { __esModule: true, default: ContentLoader, Rect: () => null };
});

describe('skeletons', () => {
  it('are sand with a lighter shimmer', async () => {
    mockReduced = false;
    await render(
      <SkeletonLoader width={100} height={10}>
        <Rect width={100} height={10} />
      </SkeletonLoader>,
    );
    const loader = screen.getByTestId('loader', { includeHiddenElements: true });
    expect(loader.props.backgroundColor).toBe(palette.sand);
    expect(loader.props.foregroundColor).toBe(SKELETON_SHINE);
    expect(loader.props.animate).toBe(true);
  });

  it('stand still with Reduce Motion', async () => {
    mockReduced = true;
    await render(
      <SkeletonLoader width={100} height={10}>
        <Rect width={100} height={10} />
      </SkeletonLoader>,
    );
    expect(screen.getByTestId('loader', { includeHiddenElements: true }).props.animate).toBe(false);
  });
});
