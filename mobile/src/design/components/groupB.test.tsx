import React from 'react';
import { AccessibilityInfo, Platform, StyleSheet, Text } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import {
  EmptyState,
  Group,
  HexAvatar,
  hexInitials,
  ListRow,
  SegmentedControl,
  segmentFit,
  toastConfig,
} from './groupB';
import { palette } from '../tokens';
import { DEFAULT_DESIGN_LABELS, setDesignLabels } from '../labels';

// The components are tested with the texts they carry themselves (Romanian), whatever language
// the rest of the suite runs in; the app replaces them through `setDesignLabels`.
beforeEach(() => setDesignLabels(DEFAULT_DESIGN_LABELS));

const options = [
  { key: 'pending', label: 'În așteptare', count: 3 },
  { key: 'approved', label: 'Aprobate' },
  { key: 'rejected', label: 'Refuzate' },
] as const;

describe('SegmentedControl', () => {
  it('marks the selected segment, reports a change and ticks a selection haptic', async () => {
    const onChange = jest.fn();
    await render(
      <SegmentedControl testID="seg" value="pending" onChange={onChange} options={[...options]} />,
    );
    expect(screen.getByTestId('seg').props.accessibilityRole).toBe('tablist');
    expect(screen.getByTestId('seg-pending').props.accessibilityState).toEqual({ selected: true });
    expect(screen.getByTestId('seg-approved').props.accessibilityState).toEqual({
      selected: false,
    });
    expect(screen.getByText('În așteptare')).toHaveStyle({ color: palette.navy });
    expect(screen.getByText('Aprobate')).toHaveStyle({ color: 'rgba(255,255,255,0.75)' });
    // the count badge is part of the segment's label
    expect(screen.getByLabelText('În așteptare, 3')).toBeTruthy();
    expect(screen.getByText('3')).toBeTruthy();

    await fireEvent.press(screen.getByText('Aprobate'));
    expect(onChange).toHaveBeenCalledWith('approved');
    expect(Haptics.selectionAsync).toHaveBeenCalled();

    await screen.rerender(
      <SegmentedControl testID="seg" value="approved" onChange={onChange} options={[...options]} />,
    );
    expect(screen.getByTestId('seg-approved').props.accessibilityState).toEqual({ selected: true });
    expect(screen.getByTestId('seg-pending').props.accessibilityState).toEqual({ selected: false });
  });

  it('exposes the full label to the iOS Large Content Viewer', async () => {
    await render(
      <SegmentedControl
        testID="seg"
        value="mine"
        onChange={jest.fn()}
        options={[
          { key: 'pending', label: 'În așteptare', count: 18 },
          { key: 'approved', label: 'Aprobate', count: 0 },
          { key: 'mine', label: 'Organizațiile mele' },
        ]}
      />,
    );
    expect(screen.container.queryAll((node) => node.type.includes('ScrollView'))).toHaveLength(0);
    expect(screen.getByTestId('seg-mine').props).toMatchObject({
      accessibilityShowsLargeContentViewer: Platform.OS === 'ios',
      accessibilityLargeContentTitle: Platform.OS === 'ios' ? 'Organizațiile mele' : undefined,
    });
  });

  it('keeps every segment style when selection and the active-only badge move', async () => {
    const keys = ['pending', 'approved', 'rejected'] as const;
    const renderControl = (value: (typeof keys)[number]) => (
      <SegmentedControl
        testID="seg"
        value={value}
        onChange={jest.fn()}
        options={options.map((option) => ({
          key: option.key,
          label: option.label,
          count: option.key === value ? 18 : undefined,
        }))}
      />
    );
    await render(renderControl('pending'));
    const stylesBefore = keys.map((key) =>
      StyleSheet.flatten(screen.getByTestId(`seg-${key}`).props.style),
    );

    await screen.rerender(renderControl('approved'));
    keys.forEach((key, index) => {
      expect(StyleSheet.flatten(screen.getByTestId(`seg-${key}`).props.style)).toEqual(
        stylesBefore[index],
      );
    });
  });

  it('shows the thumb once segments are measured', async () => {
    await render(
      <SegmentedControl
        testID="seg"
        value="approved"
        onChange={jest.fn()}
        options={[...options]}
      />,
    );
    expect(screen.queryByTestId('seg-indicator')).toBeNull();
    await fireEvent(screen.getByTestId('seg-approved'), 'layout', {
      nativeEvent: { layout: { x: 130, y: 5, width: 96, height: 42 } },
    });
    expect(screen.getByTestId('seg-indicator')).toHaveStyle({
      width: 96,
      transform: [{ translateX: 130 }],
      backgroundColor: palette.yellow,
    });
  });
});

describe('SegmentedControl with counts on every segment (Evenimente)', () => {
  // Manrope 800 widths of Deschise / Particip / Organizațiile with their badges, padding included
  const atDefault = [105, 96, 129];
  const atLargest = [130, 118, 163];
  const counts = [true, true, true];

  it('stays inline when the row fits, tightens a little, then puts the badges under the labels', () => {
    expect(segmentFit(atDefault, counts, 390 - 36 - 10)).toBe('inline');
    // iPhone SE / mini at the default size: 1pt short, the tighter padding is enough
    expect(segmentFit([111, 101, 118], counts, 375 - 36 - 10)).toBe('compact');
    // largest Dynamic Type: no word may be cut, the badge goes under the label
    expect(segmentFit(atLargest, counts, 430 - 36 - 10)).toBe('stacked');
  });

  it('measures its segments once laid out and stacks the badges when they do not fit', async () => {
    const eventOptions = [
      { key: 'OPEN', label: 'Deschise', count: 3 },
      { key: 'GOING', label: 'Particip', count: 2 },
      { key: 'ORGANIZATIONS', label: 'Organizațiile mele', count: 5 },
    ];
    await render(
      <SegmentedControl testID="seg" value="OPEN" onChange={jest.fn()} options={eventOptions} />,
    );
    // before any layout nothing is measured and the segments are inline
    expect(screen.getByTestId('seg-GOING')).toHaveStyle({ flexDirection: 'row' });
    await fireEvent(screen.getByTestId('seg'), 'layout', {
      nativeEvent: { layout: { x: 0, y: 0, width: 354, height: 52 } },
    });
    for (const [index, width] of atLargest.entries()) {
      await fireEvent(
        screen.getByTestId(`seg-measure-${eventOptions[index].key}`, {
          includeHiddenElements: true,
        }),
        'layout',
        {
          nativeEvent: { layout: { x: 0, y: 0, width, height: 30 } },
        },
      );
    }
    expect(screen.getByTestId('seg-GOING')).toHaveStyle({ flexDirection: 'column' });
    // every badge is still there, and still part of its segment's label
    expect(screen.getByLabelText('Organizațiile mele, 5')).toBeTruthy();
  });
});

describe('ListRow and Group', () => {
  it('a pressable row has a button role, a label and fires', async () => {
    const onPress = jest.fn();
    await render(
      <Group testID="grp">
        <ListRow title="Date cont" subtitle="Nume, email" onPress={onPress} testID="row-a" />
        <ListRow title="Ieși din cont" danger onPress={jest.fn()} testID="row-b" />
      </Group>,
    );
    const row = screen.getByTestId('row-a');
    expect(row.props.accessibilityRole).toBe('button');
    expect(screen.getByLabelText('Date cont, Nume, email')).toBeTruthy();
    await fireEvent.press(row);
    expect(onPress).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Ieși din cont')).toHaveStyle({ color: palette.red });
    expect(screen.getByTestId('grp')).toHaveStyle({ borderRadius: 24, overflow: 'hidden' });
  });

  it('shows the full organization separately from the clamped free-text preview', async () => {
    const organization = 'Asociația Exemplu pentru Comunitate';
    await render(
      <ListRow
        title="Anunț important"
        subtitle={organization}
        preview="Text lung de previzualizare"
      />,
    );
    expect(screen.getByText('Anunț important').props.numberOfLines).toBeUndefined();
    expect(screen.getByText(organization).props.numberOfLines).toBeUndefined();
    expect(screen.getByText('Text lung de previzualizare').props.numberOfLines).toBe(2);
  });

  it('hexagon avatar shows the initials', async () => {
    expect(hexInitials('Asociația  Exemplu Verde')).toBe('AE');
    await render(<HexAvatar name="Verde Mare" size="lg" tone="yellow" />);
    expect(screen.getByText('VM', { includeHiddenElements: true })).toHaveStyle({
      color: palette.navy,
      fontSize: 26,
    });
  });
});

describe('EmptyState', () => {
  it('renders the title as a header, one sentence and the action', async () => {
    const onPress = jest.fn();
    await render(
      <EmptyState
        testID="empty"
        title="Nicio oră respinsă"
        description="Când un coordonator respinge ore, vezi aici motivul."
        action={<Text onPress={onPress}>Adaugă ore</Text>}
      />,
    );
    expect(screen.getByRole('header', { name: 'Nicio oră respinsă' })).toBeTruthy();
    expect(screen.getByText('Când un coordonator respinge ore, vezi aici motivul.')).toBeTruthy();
    await fireEvent.press(screen.getByText('Adaugă ore'));
    expect(onPress).toHaveBeenCalled();
    expect(screen.getByTestId('empty')).toHaveStyle({ backgroundColor: palette.card });
  });
});

describe('Toast', () => {
  it('shows the text, announces it and ticks a success haptic', async () => {
    const announce = jest.spyOn(AccessibilityInfo, 'announceForAccessibility');
    await render(<>{toastConfig.success({ text1: 'Ore trimise', isVisible: true })}</>);
    expect(screen.getByText('Ore trimise')).toBeTruthy();
    const toast = screen.getByTestId('toast-ok');
    expect(toast.props.accessibilityLiveRegion).toBe('polite');
    expect(toast).toHaveStyle({ backgroundColor: palette.navy, borderRadius: 22 });
    expect(announce).toHaveBeenCalledWith('Ore trimise');
    expect(Haptics.notificationAsync).toHaveBeenCalledWith('success');
  });

  it('errors use the red circle', async () => {
    await render(<>{toastConfig.error({ text1: 'Eroare', text2: 'cod #E502' })}</>);
    expect(screen.getByTestId('toast-no')).toBeTruthy();
    expect(screen.getByText('cod #E502')).toBeTruthy();
  });
});
