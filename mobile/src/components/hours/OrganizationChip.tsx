import React, { forwardRef } from 'react';
import { Pressable, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { StyleSheet } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { IOrganizationVolunteer } from '../../common/interfaces/organization-list-item.interface';
import { fontScaleCap, palette } from '../../design/tokens';
import { CheckIcon, ChevronDownIcon, HexagonIcon } from '../../design/icons';
import { AppText } from '../../design/components/Text';
import { Group } from '../../design/components/Group';
import { ListRow } from '../../design/components/ListRow';
import { Sheet } from '../../design/components/Sheet';

export interface OrganizationChipProps {
  name: string;
  /** opens the organization switch; without it the chip only names the organization */
  onPress?: () => void;
  testID?: string;
}

/**
 * The active organization on Ore (`.chip.act`): navy with yellow text, a hexagon before the name and
 * a chevron when the volunteer can switch to another organization.
 */
export const OrganizationChip = ({ name, onPress, testID }: OrganizationChipProps) => {
  const { t } = useTranslation('activity_logs');
  const content = (
    <>
      <HexagonIcon size={14} color={palette.yellow} strokeWidth={2.6} />
      <AppText
        variant="label"
        color={palette.yellow}
        numberOfLines={2}
        maxFontSizeMultiplier={fontScaleCap.display}
        style={styles.label}
      >
        {name}
      </AppText>
      {!!onPress && <ChevronDownIcon size={14} color={palette.yellow} strokeWidth={2.6} />}
    </>
  );
  const label = `${t('at', { name })}`;
  if (!onPress) {
    return (
      <View style={styles.chip} accessible accessibilityLabel={label} testID={testID}>
        {content}
      </View>
    );
  }
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, pressed ? styles.pressed : null]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={`${t('switch_organization')}`}
      hitSlop={{ top: 6, bottom: 6, left: 4, right: 4 }}
      testID={testID}
    >
      {content}
    </Pressable>
  );
};

export interface OrganizationSwitchSheetProps {
  organizations: IOrganizationVolunteer[];
  activeId?: string;
  onSelect: (organization: IOrganizationVolunteer) => void;
}

/** The volunteer's organizations; picking one makes it the active organization. */
export const OrganizationSwitchSheet = forwardRef<BottomSheetModal, OrganizationSwitchSheetProps>(
  ({ organizations, activeId, onSelect }, ref) => {
    const { t } = useTranslation('activity_logs');
    return (
      <Sheet
        ref={ref}
        title={`${t('switch_organization')}`}
        closeLabel={`${t('general:close')}`}
        testID="hours-organization-sheet"
      >
        <Group>
          {organizations.map((organization) => (
            <ListRow
              key={organization.id}
              title={organization.name}
              avatar={{ name: organization.name }}
              trailing={
                organization.id === activeId ? (
                  <CheckIcon size={20} color={palette.navy} strokeWidth={2.6} />
                ) : null
              }
              onPress={() => onSelect(organization)}
              accessibilityLabel={organization.name}
              testID={`hours-organization-${organization.id}`}
            />
          ))}
        </Group>
      </Sheet>
    );
  },
);

OrganizationSwitchSheet.displayName = 'OrganizationSwitchSheet';

const styles = StyleSheet.create((theme) => ({
  // `.chip.act`: 28pt, padding 0 10 0 8, radius 14, gap 5, Manrope 800 12.5 (a long name wraps)
  chip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    minHeight: 28,
    maxWidth: '100%',
    paddingVertical: 4,
    paddingLeft: 8,
    paddingRight: 10,
    borderRadius: 14,
    backgroundColor: theme.colors.navy,
  },
  pressed: { transform: [{ scale: 0.96 }] },
  label: { fontSize: 12.5, lineHeight: 16, flexShrink: 1 },
}));
