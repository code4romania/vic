import React, { useCallback } from 'react';
import { RefreshControl, StyleSheet, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  useContractHistoryInfiniteQuery,
  usePendingContractsInfiniteQuery,
} from '../services/contract/contract.service';
import { IContractListItem } from '../common/interfaces/contract-list-item.interface';
import { colors, fonts, shadows, spacing } from '../common/theme/tokens';
import { useUserProfile } from '../store/profile/profile.selector';
import { useFocusedStatusBarStyle } from '../hooks/useFocusedStatusBarStyle';
import { isTabRoute } from '../routes/tab-routes';
import { useTabBarScroll } from '../components/navigation/TabBarScroll';
import { useGlassTabBarInset } from '../components/navigation/GlassTabBar';
import { EventIcon } from '../components/events/EventIcons';
import { DocumentRow } from '../components/documents/DocumentRow';
import { useDownloadContract } from '../components/documents/useDownloadContract';
import DocumentSkeletonList from '../components/skeleton/documents-skeleton-list';
import { EmptyState, Enter, Group, PressableScale, StatusBarScrim, VText } from '../components/ui';

// rows per section on the tab; "Vezi toate" opens the full list
const PREVIEW = 3;

/**
 * VIC 2.0 Documente (canvas board "Documente"): the contracts of the active organization. Contracts
 * waiting for the volunteer open the signing page; signed ones download as a file.
 */
const Documents = ({ navigation, route }: any) => {
  const { t } = useTranslation('documents');
  const insets = useSafeAreaInsets();
  const bottomInset = useGlassTabBarInset();
  useFocusedStatusBarStyle('dark');
  const onScroll = useTabBarScroll();
  const { userProfile } = useUserProfile();
  const organization = userProfile?.activeOrganization;
  const volunteerId = route.params?.volunteerId || (organization?.volunteerId as string);
  const { downloadingId, download } = useDownloadContract();

  const pending = usePendingContractsInfiniteQuery(volunteerId);
  const history = useContractHistoryInfiniteQuery(volunteerId);
  const { refetch: reloadPending } = pending;
  const { refetch: reloadHistory } = history;

  const reload = useCallback(() => {
    reloadPending();
    reloadHistory();
  }, [reloadPending, reloadHistory]);

  useFocusEffect(reload);

  const pendingItems = pending.data?.pages?.[0]?.items ?? [];
  const pendingTotal = pending.data?.pages?.[0]?.meta?.totalItems ?? pendingItems.length;
  const signedItems = history.data?.pages?.[0]?.items ?? [];
  const signedTotal = history.data?.pages?.[0]?.meta?.totalItems ?? signedItems.length;
  const isLoading = (pending.isFetching || history.isFetching) && !pending.data && !history.data;

  const section = (
    key: 'pending' | 'signed',
    title: string,
    items: IContractListItem[],
    total: number,
    onSeeAll: () => void,
    onPress: (contract: IContractListItem) => void,
  ) => (
    <View style={styles.section} testID={`documents-${key}`}>
      <View style={styles.sectionHead}>
        <VText variant="h2">{title}</VText>
        {total > PREVIEW && (
          <VText
            variant="label"
            style={styles.link}
            onPress={onSeeAll}
            accessibilityRole="button"
            testID={`documents-${key}-all`}
          >
            {t('see_all', { count: total })}
          </VText>
        )}
      </View>
      <Group>
        {items.slice(0, PREVIEW).map((contract, index, shown) => (
          <Enter key={contract.id} index={index}>
            <DocumentRow
              contract={contract}
              kind={key}
              onPress={onPress}
              busy={downloadingId === contract.id}
              divider={index < shown.length - 1}
            />
          </Enter>
        ))}
      </Group>
    </View>
  );

  return (
    <View style={styles.screen}>
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={!isLoading && (pending.isRefetching || history.isRefetching)}
            onRefresh={reload}
          />
        }
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + 12, paddingBottom: bottomInset },
        ]}
        showsVerticalScrollIndicator={false}
        testID="documents"
      >
        {!isTabRoute(route) && (
          <PressableScale
            onPress={navigation.goBack}
            style={[styles.back, shadows.back]}
            accessibilityLabel={`${t('general:back')}`}
            testID="documents-back"
          >
            <EventIcon name="back" size={20} />
          </PressableScale>
        )}
        <Enter>
          <VText variant="largeTitle" accessibilityRole="header" style={styles.title}>
            {t('general:documents')}
          </VText>
        </Enter>
        {!!organization && (
          <Enter index={1}>
            <VText variant="sub">{t('activity_logs:at', { name: organization.name })}</VText>
          </Enter>
        )}

        {isLoading && <DocumentSkeletonList />}

        {!isLoading && pendingItems.length > 0 && (
          <Enter index={2}>
            <View style={styles.callout}>
              <VText variant="label" color={colors.status.wait.fg}>
                {t('pending_callout', { count: pendingTotal })}
              </VText>
            </View>
            {section(
              'pending',
              `${t('sections.pending')}`,
              pendingItems,
              pendingTotal,
              () => navigation.navigate('pending-contracts'),
              (contract) => navigation.navigate('contract', { id: contract.id }),
            )}
          </Enter>
        )}

        {!isLoading && signedItems.length > 0 && (
          <Enter index={3}>
            {section(
              'signed',
              `${t('sections.closed')}`,
              signedItems,
              signedTotal,
              () => navigation.navigate('contract-history'),
              download,
            )}
          </Enter>
        )}

        {!isLoading && !pendingItems.length && !signedItems.length && (
          <EmptyState
            title={`${pending.error || history.error ? t('errors.generic') : t('empty.title')}`}
            description={pending.error || history.error ? undefined : `${t('empty.description')}`}
            actionLabel={pending.error || history.error ? `${t('events:retry')}` : undefined}
            onAction={pending.error || history.error ? reload : undefined}
            testID="documents-empty"
          />
        )}
      </Animated.ScrollView>
      <StatusBarScrim />
    </View>
  );
};

export default Documents;

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: spacing.gutter, flexGrow: 1 },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { marginTop: 16, marginBottom: 4 },
  callout: {
    marginTop: 20,
    borderRadius: 12,
    padding: 14,
    backgroundColor: colors.status.wait.bg,
  },
  section: { marginTop: 24 },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  link: { fontFamily: fonts.bold, textDecorationLine: 'underline' },
});
