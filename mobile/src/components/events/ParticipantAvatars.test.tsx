import React from 'react';
import { render, screen } from '@testing-library/react-native';
import ParticipantAvatars from './ParticipantAvatars';

const preview = ['ȘT', 'AM', 'ID', 'RL', 'EM'].map((initials) => ({ initials }));

describe('ParticipantAvatars', () => {
  it('shows three faces and a „+N” bubble for the rest, as one labelled image', async () => {
    await render(
      <ParticipantAvatars
        participants={{ total: 18, preview }}
        accessibilityLabel="18 persoane participă"
      />,
    );
    const row = screen.getByLabelText('18 persoane participă');
    expect(row.props.accessibilityRole).toBe('image');
    expect(screen.getAllByTestId('event-participants-face')).toHaveLength(3);
    expect(screen.getByText('ȘT')).toBeTruthy();
    expect(screen.getByText('ID')).toBeTruthy();
    expect(screen.queryByText('RL')).toBeNull();
    expect(screen.getByText('+15')).toBeTruthy();
  });

  it('shows up to five faces when asked', async () => {
    await render(
      <ParticipantAvatars
        participants={{ total: 7, preview }}
        max={5}
        accessibilityLabel="7 persoane participă"
      />,
    );
    expect(screen.getAllByTestId('event-participants-face')).toHaveLength(5);
    expect(screen.getByText('+2')).toBeTruthy();
  });

  it('has no bubble when everyone is shown', async () => {
    await render(
      <ParticipantAvatars
        participants={{ total: 2, preview: preview.slice(0, 2) }}
        accessibilityLabel="2 persoane participă"
      />,
    );
    expect(screen.getAllByTestId('event-participants-face')).toHaveLength(2);
    expect(screen.queryByTestId('event-participants-more')).toBeNull();
  });

  it('caps the bubble at +99', async () => {
    await render(
      <ParticipantAvatars
        participants={{ total: 500, preview }}
        accessibilityLabel="500 de persoane participă"
      />,
    );
    expect(screen.getByText('+99')).toBeTruthy();
  });

  it('shows the picture instead of the initials when there is one', async () => {
    await render(
      <ParticipantAvatars
        participants={{
          total: 1,
          preview: [{ initials: 'AP', avatarUrl: 'https://example.ro/a.jpg' }],
        }}
        accessibilityLabel="O persoană participă"
      />,
    );
    expect(screen.queryByText('AP')).toBeNull();
    expect(screen.getByTestId('event-participants-photo').props.source).toEqual({
      uri: 'https://example.ro/a.jpg',
    });
  });

  it('renders nothing when nobody is going or there is no preview', async () => {
    const { toJSON } = await render(
      <ParticipantAvatars participants={{ total: 0, preview: [] }} accessibilityLabel="x" />,
    );
    expect(toJSON()).toBeNull();
    const second = await render(
      <ParticipantAvatars participants={{ total: 4, preview: [] }} accessibilityLabel="x" />,
    );
    expect(second.toJSON()).toBeNull();
    const third = await render(<ParticipantAvatars participants={null} accessibilityLabel="x" />);
    expect(third.toJSON()).toBeNull();
  });

  it('keeps the initials fixed-size (the circle does not grow with Dynamic Type)', async () => {
    await render(
      <ParticipantAvatars
        participants={{ total: 1, preview: [{ initials: 'ȘT' }] }}
        accessibilityLabel="O persoană participă"
      />,
    );
    expect(screen.getByText('ȘT').props.allowFontScaling).toBe(false);
  });
});
