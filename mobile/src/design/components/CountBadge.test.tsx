import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { badgeLabel, CountBadge } from './CountBadge';
import { palette } from '../tokens';

describe('CountBadge', () => {
  it('hides at 0, shows the number up to 9 and „9+” above', () => {
    expect(badgeLabel(0)).toBeNull();
    expect(badgeLabel(undefined)).toBeNull();
    expect(badgeLabel(-1)).toBeNull();
    expect(badgeLabel(1)).toBe('1');
    expect(badgeLabel(9)).toBe('9');
    expect(badgeLabel(10)).toBe('9+');
    expect(badgeLabel(120)).toBe('9+');
  });

  it('renders nothing at 0', async () => {
    await render(<CountBadge count={0} testID="badge" />);
    expect(screen.queryByTestId('badge', { includeHiddenElements: true })).toBeNull();
  });

  it('is the prototype `.badge-n`: red, white Manrope 800 11, paper ring, hidden from screen readers', async () => {
    await render(<CountBadge count={12} testID="badge" />);
    const badge = screen.getByTestId('badge', { includeHiddenElements: true });
    expect(badge).toHaveStyle({
      backgroundColor: palette.red,
      borderColor: palette.paper,
      borderWidth: 2,
      position: 'absolute',
      top: 0,
      right: -2,
      minWidth: 24,
      height: 24,
    });
    expect(screen.getByText('9+', { includeHiddenElements: true })).toHaveStyle({
      color: palette.white,
      fontFamily: 'Manrope_800ExtraBold',
      fontSize: 11,
    });
    // the button around it says the count
    expect(screen.queryByText('9+')).toBeNull();
  });
});
