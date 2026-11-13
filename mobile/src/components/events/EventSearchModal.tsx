import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from 'react-native';
import Animated, { FadeIn, LinearTransition, useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native-unistyles';
import { AppText, Button, OptionChip } from '../../design/components';
import { CloseIcon, ICON_STROKE, SearchIcon } from '../../design/icons';
import { fontScaleCap, palette } from '../../design/tokens';
import { duration, enter } from '../../design/motion';
import { PressableScale } from '../ui';
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
 * Full-screen event search on paper, with the keyboard up: three white cards, Ce / Când /
 * Organizație, one open at a time, and a bar with "Șterge tot" and "Arată N evenimente".
 * The content mounts each time it opens (a fresh draft, and no count request while hidden).
 */
export const EventSearchModal = ({ visible, onClose, ...props }: EventSearchModalProps) => (
  <Modal
    visible={visible}
    animationType="fade"
    onRequestClose={onClose}
    presentationStyle="overFullScreen"
    transparent
    statusBarTranslucent
  >
    <EventSearch {...props} onClose={onClose} />
  </Modal>
);

const EventSearch = ({
  initialFilters,
  organizations,
  eventFilter,
  onApply,
  onClose,
}: Omit<EventSearchModalProps, 'visible'>) => {
  const { t } = useTranslation('events');
  const insets = useSafeAreaInsets();
  const reduced = useReducedMotion();
  const [draft, setDraft] = useState<EventFilters>(initialFilters);
  const [open, setOpen] = useState<Section>('what');

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
  const layout = reduced
    ? LinearTransition.duration(duration.reduced)
    : LinearTransition.springify().stiffness(260).damping(30);

  const sectionHeader = (section: Section, label: string, value: string) => (
    <Pressable
      onPress={() => setOpen(section)}
      style={styles.shead}
      accessibilityRole="button"
      accessibilityLabel={`${label}: ${value}`}
      testID={`search-section-${section}`}
    >
      <AppText variant="caption" color={palette.ink2}>
        {label}
      </AppText>
      <AppText variant="bodyStrong" numberOfLines={2} style={styles.sheadValue}>
        {value}
      </AppText>
    </Pressable>
  );

  const sectionTitle = (title: string) => (
    <Animated.View entering={FadeIn.duration(200)} style={styles.sectionTitle}>
      <AppText variant="title" accessibilityRole="header" style={styles.sectionTitleText}>
        {title}
      </AppText>
    </Animated.View>
  );

  return (
    <>
      {/* the bottom bar (Șterge tot / Arată N evenimente) stays above the keyboard */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.screen, { paddingTop: insets.top }]}
        testID="event-search"
      >
        <View style={styles.header}>
          <PressableScale
            onPress={onClose}
            accessibilityLabel={`${t('search.close')}`}
            style={styles.round}
            testID="search-close"
          >
            <CloseIcon size={20} color={palette.navy} strokeWidth={ICON_STROKE + 0.4} />
          </PressableScale>
          <AppText variant="headline" accessibilityRole="header">
            {t('search.title')}
          </AppText>
          {/* keeps the title centered */}
          <View style={styles.spacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.cards}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View layout={layout} entering={enter(0, reduced)} style={styles.card}>
            {open === 'what' ? (
              <>
                {sectionTitle(t('search.what_title'))}
                <Animated.View entering={FadeIn.duration(240)} style={styles.sectionBody}>
                  <View style={styles.input}>
                    <SearchIcon size={20} color={palette.ink2} />
                    <TextInput
                      value={draft.search}
                      onChangeText={(search) => setDraft((d) => ({ ...d, search }))}
                      placeholder={`${t('search.what_placeholder')}`}
                      placeholderTextColor={palette.ink2}
                      allowFontScaling
                      maxFontSizeMultiplier={fontScaleCap.text}
                      returnKeyType="search"
                      onSubmitEditing={() => setOpen('when')}
                      autoFocus
                      selectionColor={palette.navy}
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

          <Animated.View layout={layout} entering={enter(1, reduced)} style={styles.card}>
            {open === 'when' ? (
              <>
                {sectionTitle(t('search.when_title'))}
                <Animated.View entering={FadeIn.duration(240)} style={styles.chips}>
                  {WHEN_OPTIONS.map((when) => (
                    <OptionChip
                      key={when}
                      label={`${t(`search.when_options.${when}`)}`}
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

          <Animated.View layout={layout} entering={enter(2, reduced)} style={styles.card}>
            {open === 'organization' ? (
              <>
                {sectionTitle(t('search.organization_title'))}
                <Animated.View entering={FadeIn.duration(240)} style={styles.chips}>
                  <OptionChip
                    label={`${t('search.all_organizations')}`}
                    selected={!draft.organizationId}
                    onPress={() => setDraft((d) => ({ ...d, organizationId: undefined }))}
                    testID="organization-all"
                  />
                  {organizations.map((org) => (
                    <OptionChip
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
          entering={enter(3, reduced)}
          style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 16) + 8 }]}
        >
          <Pressable
            onPress={() => setDraft(EMPTY_EVENT_FILTERS)}
            hitSlop={12}
            accessibilityRole="button"
            testID="search-clear"
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
            icon={<SearchIcon size={18} color={palette.navy} strokeWidth={ICON_STROKE + 0.4} />}
            onPress={() => onApply(draft)}
            style={styles.apply}
            testID="search-apply"
          />
        </Animated.View>
      </KeyboardAvoidingView>
    </>
  );
};

export default EventSearchModal;

const styles = StyleSheet.create((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.paper },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.space.gutter,
    paddingTop: 10,
    paddingBottom: 8,
  },
  spacer: { width: 46, height: 46 },
  round: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: theme.colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cards: { gap: 10, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 24 },
  card: { backgroundColor: theme.colors.card, borderRadius: theme.radius.card, overflow: 'hidden' },
  shead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 60,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 16,
  },
  sheadValue: { flexShrink: 1, textAlign: 'right' },
  sectionTitle: { paddingTop: 20, paddingHorizontal: 20, paddingBottom: 2 },
  sectionTitleText: { fontSize: 28, lineHeight: 31 },
  sectionBody: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16 },
  // the field on paper inside the white card: a big, calm target
  input: {
    height: 58,
    borderRadius: 22,
    backgroundColor: theme.colors.paper,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
  },
  inputText: {
    flex: 1,
    fontFamily: theme.fontFamily.textBold,
    fontSize: 15,
    color: theme.colors.ink,
    padding: 0,
  },
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
    backgroundColor: theme.colors.paper,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: theme.colors.line,
    paddingTop: 12,
    paddingHorizontal: theme.space.gutter,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: 16,
    rowGap: 12,
  },
  clear: { textDecorationLine: 'underline' },
  apply: { marginLeft: 'auto', maxWidth: '100%' },
}));
