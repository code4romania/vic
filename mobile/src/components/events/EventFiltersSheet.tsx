import React, { forwardRef } from 'react';
import { Pressable, View } from 'react-native';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { StyleSheet } from 'react-native-unistyles';
import { useTranslation } from 'react-i18next';
import { AppText, Button, OptionChip, Sheet } from '../../design/components';
import { palette } from '../../design/tokens';
import { EMPTY_EVENT_FILTERS, EventFilters, EventWhen } from './event-filters';

const WHEN_OPTIONS: EventWhen[] = ['any', 'week', 'month'];

export interface EventFiltersSheetProps {
  filters: EventFilters;
  organizations: { id: string; name: string }[];
  /** applied right away: the list behind the half-open sheet follows each choice */
  onChange: (filters: EventFilters) => void;
  /** events for the current filters, for "Arată N evenimente" (undefined while loading) */
  count?: number;
  /** "Arată N evenimente": closes the sheet */
  onClose: () => void;
  onDismiss?: () => void;
}

/**
 * The filters as a two-detent sheet (50% / 92%): Când and Organizație as quick options. A choice
 * applies at once, so at 50% the list above already shows the result; the footer clears the
 * filters (the search text stays) or closes with "Arată N evenimente".
 */
export const EventFiltersSheet = forwardRef<BottomSheetModal, EventFiltersSheetProps>(
  ({ filters, organizations, onChange, count, onClose, onDismiss }, ref) => {
    const { t } = useTranslation('events');
    const hasFilters = filters.when !== 'any' || !!filters.organizationId;

    return (
      <Sheet
        ref={ref}
        variant="filters"
        title={`${t('search.filters')}`}
        closeLabel={`${t('search.close')}`}
        onDismiss={onDismiss}
        testID="events-filters"
        footer={
          <View style={styles.footer}>
            <Pressable
              onPress={() => onChange({ ...EMPTY_EVENT_FILTERS, search: filters.search })}
              disabled={!hasFilters}
              hitSlop={12}
              accessibilityRole="button"
              accessibilityState={{ disabled: !hasFilters }}
              testID="filters-clear"
              style={!hasFilters ? styles.dim : null}
            >
              <AppText variant="bodyStrong" style={styles.clear}>
                {t('search.clear')}
              </AppText>
            </Pressable>
            <Button
              label={
                count === undefined
                  ? `${t('search.show')}`
                  : `${t(count === 1 ? 'search.show_one' : 'search.show_count', { n: count })}`
              }
              onPress={onClose}
              size="M"
              style={styles.apply}
              testID="filters-apply"
            />
          </View>
        }
      >
        <View style={styles.section}>
          <AppText variant="overline" color={palette.ink2}>
            {t('search.when')}
          </AppText>
          <View style={styles.options}>
            {WHEN_OPTIONS.map((when) => (
              <OptionChip
                key={when}
                label={`${t(`search.when_options.${when}`)}`}
                selected={filters.when === when}
                onPress={() => onChange({ ...filters, when })}
                testID={`filter-when-${when}`}
              />
            ))}
          </View>
        </View>
        <View style={styles.section}>
          <AppText variant="overline" color={palette.ink2}>
            {t('search.organization')}
          </AppText>
          <View style={styles.options}>
            <OptionChip
              label={`${t('search.all_organizations')}`}
              selected={!filters.organizationId}
              onPress={() => onChange({ ...filters, organizationId: undefined })}
              testID="filter-organization-all"
            />
            {organizations.map((org) => (
              <OptionChip
                key={org.id}
                label={org.name}
                selected={filters.organizationId === org.id}
                onPress={() => onChange({ ...filters, organizationId: org.id })}
                testID={`filter-organization-${org.id}`}
              />
            ))}
          </View>
        </View>
      </Sheet>
    );
  },
);

EventFiltersSheet.displayName = 'EventFiltersSheet';

export default EventFiltersSheet;

const styles = StyleSheet.create((theme) => ({
  section: { gap: 10 },
  options: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  // at large text sizes the button moves under "Șterge filtrele" instead of squeezing its label
  footer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: 16,
    rowGap: 12,
  },
  clear: { textDecorationLine: 'underline', color: theme.colors.ink },
  dim: { opacity: 0.45 },
  apply: { marginLeft: 'auto', maxWidth: '100%' },
}));
