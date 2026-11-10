import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  BottomSheetFlatList,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { Control, Controller } from 'react-hook-form';
import Svg, { Path } from 'react-native-svg';
import { colors, fonts, radius } from '../common/theme/tokens';
import { PressableScale, Sheet, VText, VTextField } from './ui';
import { EventIcon } from './events/EventIcons';

// Longer lists (counties, cities) open in a tall sheet with a search field.
const LONG_LIST = 12;

// Case and diacritics don't matter when searching ("brasov" finds "Brașov").
const normalize = (text: string) =>
  text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

export interface ISelectItem {
  label: string;
  key: string | number;
}

export interface FormSelectProps {
  control: Control<Record<string, any>>;
  options: ISelectItem[];
  name: string;
  label: string;
  placeholder: string;
  error: any;
  required?: boolean;
  disabled?: boolean;
  /** kept for older callers; the VIC 2.0 field has no leading icon */
  accessoryLeft?: unknown;
}

const ChevronDown = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path d="m6 9 6 6 6-6" stroke={colors.muted} strokeWidth={2} strokeLinecap="round" />
  </Svg>
);

const Check = () => (
  <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
    <Path
      d="m5 12 5 5 9-10"
      stroke={colors.navy}
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Option = ({
  option,
  active,
  onPress,
  testID,
}: {
  option: ISelectItem;
  active: boolean;
  onPress: () => void;
  testID: string;
}) => (
  <PressableScale
    onPress={onPress}
    pressedScale={0.99}
    style={styles.option}
    accessibilityRole="button"
    accessibilityState={{ selected: active }}
    testID={testID}
  >
    <VText variant={active ? 'bodyStrong' : 'body'} style={styles.text}>
      {option.label}
    </VText>
    {active && <Check />}
  </PressableScale>
);

/**
 * VIC 2.0 select: an outlined field like the text fields; tapping it opens a sheet with the options.
 */
const FormSelect: React.FC<FormSelectProps> = ({
  control,
  options,
  name,
  label,
  placeholder,
  error,
  required,
  disabled,
}: FormSelectProps) => {
  const { t } = useTranslation('general');
  const sheet = useRef<BottomSheetModal>(null);
  const title = required ? `${label} *` : label;
  const long = options.length > LONG_LIST;
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const needle = normalize(query);
    return needle
      ? options.filter((option) => normalize(`${option.label}`).includes(needle))
      : options;
  }, [options, query]);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value } }) => {
        const selected = options.find((option) => option.key === value);
        return (
          <View style={styles.wrapper}>
            <PressableScale
              onPress={() => sheet.current?.present()}
              disabled={disabled}
              pressedScale={0.99}
              style={[styles.field, !!error && styles.invalid, disabled && styles.disabled]}
              accessibilityLabel={`${label}${selected ? `, ${selected.label}` : ''}`}
              testID={`select-${name}`}
            >
              <View style={styles.text}>
                <VText variant="cap">{title}</VText>
                <VText
                  variant="body"
                  numberOfLines={1}
                  color={selected ? (disabled ? colors.muted : colors.ink) : colors.subtle}
                  style={styles.value}
                >
                  {selected ? selected.label : placeholder}
                </VText>
              </View>
              <ChevronDown />
            </PressableScale>
            {!!error?.message && (
              <VText variant="cap" color={colors.danger}>
                {error.message}
              </VText>
            )}
            <Sheet
              ref={sheet}
              title={label}
              testID={`select-${name}-sheet`}
              fullHeight={long}
              closeLabel={`${t('close')}`}
              onDismiss={() => setQuery('')}
            >
              {long ? (
                <>
                  <View style={styles.search}>
                    <VTextField
                      label={`${t('search_list')}`}
                      value={query}
                      onChangeText={setQuery}
                      InputComponent={BottomSheetTextInput}
                      autoCorrect={false}
                      returnKeyType="search"
                      leading={<EventIcon name="search" size={18} color={colors.muted} />}
                      testID={`select-${name}-search`}
                    />
                  </View>
                  <BottomSheetFlatList
                    data={filtered}
                    keyExtractor={(option: ISelectItem) => `${option.key}`}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                    contentContainerStyle={styles.list}
                    initialNumToRender={20}
                    ListEmptyComponent={
                      <VText variant="sub" style={styles.empty}>
                        {`${t('no_results', { query })}`}
                      </VText>
                    }
                    renderItem={({ item: option }: { item: ISelectItem }) => (
                      <Option
                        option={option}
                        active={option.key === value}
                        onPress={() => {
                          onChange(option.key);
                          sheet.current?.dismiss();
                        }}
                        testID={`select-${name}-option-${option.key}`}
                      />
                    )}
                  />
                </>
              ) : (
                <BottomSheetScrollView style={styles.options}>
                  {options.map((option) => (
                    <Option
                      key={option.key}
                      option={option}
                      active={option.key === value}
                      onPress={() => {
                        onChange(option.key);
                        sheet.current?.dismiss();
                      }}
                      testID={`select-${name}-option-${option.key}`}
                    />
                  ))}
                </BottomSheetScrollView>
              )}
            </Sheet>
          </View>
        );
      }}
    />
  );
};

export default FormSelect;

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  field: {
    minHeight: 56,
    borderRadius: radius.field,
    borderWidth: 1,
    borderColor: colors.subtle,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  invalid: { borderColor: colors.danger },
  disabled: { backgroundColor: colors.soft, borderColor: colors.line },
  text: { flex: 1 },
  value: { marginTop: 2, fontFamily: fonts.regular },
  options: { maxHeight: 420 },
  search: { paddingHorizontal: 20 },
  list: { paddingHorizontal: 20, paddingBottom: 24 },
  empty: { paddingVertical: 24, textAlign: 'center' },
  option: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.line,
  },
});
