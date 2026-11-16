import React from 'react';
import { Text, useWindowDimensions } from 'react-native';
import { render, screen } from '@testing-library/react-native';
import { ListRow, RowChevron } from './ListRow';
import { Chevron, ListRow as LegacyListRow } from '../../components/ui/ListRow';

jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: jest.fn(),
}));

it.each([1, 1.2, 3.2])(
  'keeps default and explicit chevrons beside the text at font scale %s',
  async (fontScale) => {
    jest.mocked(useWindowDimensions).mockReturnValue({
      width: 390,
      height: 844,
      scale: 3,
      fontScale,
    });
    await render(
      <>
        <ListRow title="Anunț" subtitle="Organizație" onPress={jest.fn()} />
        <LegacyListRow title="Acasă" onPress={jest.fn()} />
        <ListRow title="Explicit" trailing={<RowChevron />} />
        <LegacyListRow title="Legacy" trailing={<Chevron />} />
      </>,
    );
    // Only the title/subtitle belong to the text column; chevrons remain its siblings.
    expect(screen.getByText('Anunț').parent?.children).toHaveLength(2);
    expect(screen.getByText('Acasă').parent?.children).toHaveLength(1);
    expect(screen.getByText('Explicit').parent?.children).toHaveLength(1);
    expect(screen.getByText('Legacy').parent?.children).toHaveLength(1);
  },
);

it.each([1, 1.2, 3.2])('stacks a status pill only at large font scales (%s)', async (fontScale) => {
  jest.mocked(useWindowDimensions).mockReturnValue({
    width: 390,
    height: 844,
    scale: 3,
    fontScale,
  });
  await render(<ListRow title="Organizație" trailing={<Text>Activa</Text>} />);
  const textColumn = screen.getByText('Organizație').parent;
  if (fontScale >= 1.2) {
    expect(screen.getByText('Activa').parent).toHaveStyle({
      alignSelf: 'flex-start',
      marginTop: 6,
    });
    expect(textColumn?.children).toHaveLength(2);
  } else {
    expect(screen.getByText('Activa').parent).toHaveStyle({ flexDirection: 'row' });
    expect(textColumn?.children).toHaveLength(1);
  }
});
