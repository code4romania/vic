import React, { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, LinearTransition } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, fonts, motion, shadows } from '../../common/theme/tokens';
import { ALLOW_FONT_SCALLING } from '../../common/constants/constants';
import { Chip, PressableScale, VButton, VText } from '../ui';
import { EventIcon } from './EventIcons';
import { EMPTY_EVENT_FILTERS, EventFilters, EventWhen, toEventQueryFilters } from './event-filters';
import { EventType } from '../../common/enums/event-type.enum';
import { OrderDirection } from '../../common/enums/order-direction.enum';
import { useEventsInfiniteQuery } from '../../services/event/event.service';

type Section = 'what' | 'when' | 'organization';

export interface EventSearchModalProps {
  visible: boolean;
  initialFilters: EventFilters;
  organizations: { id: string; name: string }[];
  /** The tab the search runs in (Deschise / Particip / Organizațiile mele). */
  eventFilter: EventType;
  onApply: (filters: EventFilters) => void;
  onClose: () => void;
}

const WHEN_OPTIONS: EventWhen[] = ['any', 'week', 'month'];

/**
 * Full-screen event search (Airbnb pattern): three cards, Ce / Când / Organizație, one open at a
 * time, and a bottom bar with "Șterge tot" and "Arată N evenimente".
 */
export const EventSearchModal = ({
  visible,
  initialFilters,
  organizations,
  eventFilter,
  onApply,
  onClose,
}: EventSearchModalProps) => {
  const { t } = useTranslation('events');
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState<EventFilters>(initialFilters);
  const [open, setOpen] = useState<Section>('what');

  useEffect(() => {
    if (visible) {
      setDraft(initialFilters);
      setOpen('what');
    }
  }, [visible, initialFilters]);

  // live count for "Arată N evenimente"; the text is debounced so typing doesn't fire a request per key
  const [countSearch, setCountSearch] = useState(draft.search);
  useEffect(() => {
    const timer = setTimeout(() => setCountSearch(draft.search), 300);
    return () => clearTimeout(timer);
  }, [draft.search]);
  const { data: countData, isFetching: isCounting } = useEventsInfiniteQuery(
    OrderDirection.ASC,
    countSearch,
    eventFilter,
    toEventQueryFilters(draft),
  );
  const count = isCounting ? undefined : countData?.pages?.[0]?.meta?.totalItems;
  const whenLabel = t(`search.when_options.${draft.when}`);
  const organizationLabel =
    organizations.find((org) => org.id === draft.organizationId)?.name ??
    t('search.all_organizations');

  const sectionHeader = (section: Section, label: string, value: string) => (
    <Pressable
      onPress={() => setOpen(section)}
      style={styles.shead}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      testID={`search-section-${section}`}
    >
      <VText variant="sub">{label}</VText>
      <VText variant="label" numberOfLines={1} style={styles.sheadValue}>
        {value}
      </VText>
    </Pressable>
  );

  const sectionTitle = (title: string) => (
    <Animated.View entering={FadeIn.duration(200)} style={styles.sectionTitle}>
      <VText variant="largeTitle" style={styles.sectionTitleText}>
        {title}
      </VText>
    </Animated.View>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      transparent
      statusBarTranslucent
    >
      <View style={[styles.screen, { paddingTop: insets.top }]} testID="event-search">
        <View style={styles.header}>
          <PressableScale
            onPress={onClose}
            accessibilityLabel={`${t('search.close')}`}
            style={[styles.round, shadows.back]}
            testID="search-close"
          >
            <EventIcon name="close" size={18} />
          </PressableScale>
          <VText variant="h3" style={styles.headerTitle}>
            {t('search.title')}
          </VText>
          <View style={styles.round} />
        </View>

        <ScrollView
          contentContainerStyle={styles.cards}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            layout={LinearTransition.duration(motion.sheet.duration)}
            entering={FadeInDown.duration(420)}
            style={[styles.card, shadows.card]}
          >
            {open === 'what' ? (
              <>
                {sectionTitle(t('search.what_title'))}
                <Animated.View entering={FadeIn.duration(240)} style={styles.sectionBody}>
                  <View style={styles.input}>
                    <EventIcon name="search" size={18} color={colors.muted} />
                    <TextInput
                      value={draft.search}
                      onChangeText={(search) => setDraft((d) => ({ ...d, search }))}
                      placeholder={`${t('search.what_placeholder')}`}
                      placeholderTextColor={colors.muted}
                      allowFontScaling={ALLOW_FONT_SCALLING}
                      returnKeyType="search"
                      onSubmitEditing={() => setOpen('when')}
                      autoFocus
                      style={styles.inputText}
                      testID="search-input"
                    />
                  </View>
                </Animated.View>
              </>
            ) : (
              sectionHeader('what', t('search.what'), draft.search || t('search.any_activity'))
            )}
          </Animated.View>

          <Animated.View
            layout={LinearTransition.duration(motion.sheet.duration)}
            entering={FadeInDown.duration(420).delay(60)}
            style={[styles.card, shadows.card]}
          >
            {open === 'when' ? (
              <>
                {sectionTitle(t('search.when_title'))}
                <Animated.View entering={FadeIn.duration(240)} style={styles.chips}>
                  {WHEN_OPTIONS.map((when) => (
                    <Chip
                      key={when}
                      label={t(`search.when_options.${when}`)}
                      selected={draft.when === when}
                      onPress={() => setDraft((d) => ({ ...d, when }))}
                      testID={`when-${when}`}
                    />
                  ))}
                </Animated.View>
              </>
            ) : (
              sectionHeader('when', t('search.when'), whenLabel)
            )}
          </Animated.View>

          <Animated.View
            layout={LinearTransition.duration(motion.sheet.duration)}
            entering={FadeInDown.duration(420).delay(120)}
            style={[styles.card, shadows.card]}
          >
            {open === 'organization' ? (
              <>
                {sectionTitle(t('search.organization_title'))}
                <Animated.View entering={FadeIn.duration(240)} style={styles.chips}>
                  <Chip
                    label={t('search.all_organizations')}
                    selected={!draft.organizationId}
                    onPress={() => setDraft((d) => ({ ...d, organizationId: undefined }))}
                    testID="organization-all"
                  />
                  {organizations.map((org) => (
                    <Chip
                      key={org.id}
                      label={org.name}
                      selected={draft.organizationId === org.id}
                      onPress={() => setDraft((d) => ({ ...d, organizationId: org.id }))}
                      testID={`organization-${org.id}`}
                    />
                  ))}
                </Animated.View>
              </>
            ) : (
              sectionHeader('organization', t('search.organization'), organizationLabel)
            )}
          </Animated.View>
        </ScrollView>

        <Animated.View
          entering={FadeInDown.duration(360).delay(120)}
          style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}
        >
          <Pressable
            onPress={() => setDraft(EMPTY_EVENT_FILTERS)}
            hitSlop={8}
            accessibilityRole="button"
            testID="search-clear"
          >
            <VText variant="label" style={styles.clear}>
              {t('search.clear')}
            </VText>
          </Pressable>
          <VButton
            label={
              count === undefined
                ? `${t('search.show')}`
                : `${t(count === 1 ? 'search.show_one' : 'search.show_count', { n: count })}`
            }
            icon={<EventIcon name="search" size={18} color={colors.navy} />}
            onPress={() => onApply(draft)}
            testID="search-apply"
          />
        </Animated.View>
      </View>
    </Modal>
  );
};

export default EventSearchModal;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F7F7F7' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 8,
  },
  headerTitle: { fontSize: 15 },
  round: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cards: { gap: 12, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 24 },
  card: { backgroundColor: colors.white, borderRadius: 24, overflow: 'hidden' },
  shead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    gap: 16,
  },
  sheadValue: { flexShrink: 1, fontFamily: fonts.medium },
  sectionTitle: { paddingTop: 20, paddingHorizontal: 20, paddingBottom: 4 },
  sectionTitleText: { fontSize: 26, lineHeight: 30 },
  sectionBody: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 20 },
  input: {
    height: 52,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.subtle,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
  },
  inputText: { flex: 1, fontFamily: fonts.regular, fontSize: 15, color: colors.ink, padding: 0 },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  bar: {
    marginTop: 'auto',
    backgroundColor: colors.white,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.line,
    paddingTop: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clear: { fontFamily: fonts.bold, textDecorationLine: 'underline' },
});
