import React, { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { PressableScale } from './PressableScale';
import { VText } from './VText';
import { colors } from '../../common/theme/tokens';

export interface ListRowProps {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress?: () => void;
  /** Hairline under the row, as in iOS settings lists. */
  divider?: boolean;
  destructive?: boolean;
  testID?: string;
}

export const Chevron = ({ color = colors.subtle }: { color?: string }) => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="m9 6 6 6-6 6"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/** Settings-style row: optional leading icon, title + subtitle, chevron when pressable. */
export const ListRow = ({
  title,
  subtitle,
  leading,
  trailing,
  onPress,
  divider = true,
  destructive,
  testID,
}: ListRowProps) => {
  const content = (
    <>
      {leading}
      <View style={styles.text}>
        <VText variant="bodyStrong" color={destructive ? colors.danger : colors.ink}>
          {title}
        </VText>
        {!!subtitle && <VText variant="sub">{subtitle}</VText>}
      </View>
      {trailing ?? (onPress ? <Chevron /> : null)}
    </>
  );
  const style = [styles.row, divider ? styles.divider : null];
  return onPress ? (
    <PressableScale
      testID={testID}
      onPress={onPress}
      accessibilityLabel={title}
      style={style}
      pressedScale={0.99}
    >
      {content}
    </PressableScale>
  ) : (
    <View testID={testID} style={style}>
      {content}
    </View>
  );
};

export default ListRow;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 16 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.line },
  text: { flex: 1, gap: 2 },
});
