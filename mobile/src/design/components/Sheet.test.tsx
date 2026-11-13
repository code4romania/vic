import React from 'react';
import { StyleSheet, Text } from 'react-native';
import { render, screen, within } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';
import { Sheet } from './Sheet';

jest.mock('@gorhom/bottom-sheet', () => {
  const mock = require('@gorhom/bottom-sheet/mock');
  const React = require('react');
  const { View } = require('react-native');
  return {
    ...mock,
    BottomSheetView: View,
    BottomSheetModal: class extends mock.BottomSheetModal {
      render() {
        return React.createElement(View, { ...this.props, testID: 'mock-sheet-modal' });
      }
    },
  };
});

describe('auto Sheet content sizing', () => {
  it.each([0, 34, 48])(
    'keeps plain content and bottom inset %s in BottomSheetView',
    async (bottom) => {
      await render(
        <SafeAreaProvider
          initialMetrics={{
            frame: { x: 0, y: 0, width: 390, height: 844 },
            insets: { top: 24, bottom, left: 0, right: 0 },
          }}
        >
          <Sheet title="Confirm" testID="plain-sheet" footer={<Text>Confirm action</Text>}>
            <Text>Confirm body</Text>
          </Sheet>
        </SafeAreaProvider>,
      );
      expect(screen.getByTestId('mock-sheet-modal').props.children.type).toBe(BottomSheetView);
      expect(screen.getByTestId('plain-sheet')).toHaveStyle({
        paddingBottom: Math.max(bottom, 14) + 10,
      });
      expect(screen.container.queryAll((node) => node.type.includes('ScrollView'))).toHaveLength(0);
    },
  );

  it('includes the header, body and inline footer in the single scrollable measurement', async () => {
    await render(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 390, height: 844 },
          insets: { top: 24, bottom: 48, left: 0, right: 0 },
        }}
      >
        <Sheet
          scrollable
          title="Picker"
          subtitle="Choose one"
          testID="scroll-sheet"
          footer={<Text>Footer</Text>}
        >
          <Text>Last row</Text>
        </Sheet>
      </SafeAreaProvider>,
    );
    const modal = screen.getByTestId('mock-sheet-modal');
    expect(modal.props.children.type).toBe(BottomSheetScrollView);
    expect(modal.props.footerComponent).toBeUndefined();
    expect(modal.props.children.props.keyboardShouldPersistTaps).toBe('handled');
    expect(StyleSheet.flatten(modal.props.children.props.contentContainerStyle).paddingBottom).toBe(
      58,
    );
    const content = within(screen.getByTestId('scroll-sheet'));
    for (const text of ['Picker', 'Choose one', 'Last row', 'Footer']) {
      expect(content.getByText(text)).toBeTruthy();
    }
  });
});
