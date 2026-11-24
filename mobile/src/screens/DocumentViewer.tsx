import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native-unistyles';
import * as FileSystem from 'expo-file-system/legacy';
import { IContractListItem } from '../common/interfaces/contract-list-item.interface';
import { DocumentType } from '../common/enums/document-type.enum';
import { contractCachePath, fetchContractFile } from '../common/utils/download-contract';
import { useDownloadContract } from '../components/documents/useDownloadContract';
import { DocumentActionButton } from '../components/documents/DocumentActionButton';
import { PushedHeader } from '../components/ui/ScreenChrome';
import { EmptyState } from '../components/ui';
import { AppText } from '../design/components/Text';
import { DownloadIcon, ShareAndroidIcon, ShareIcon } from '../design/icons';
import { palette } from '../design/tokens';
import { useFocusedStatusBarStyle } from '../hooks/useFocusedStatusBarStyle';

// loaded only when a document opens: binaries without the native viewer never evaluate it
// (a require inside the factory: evaluated on first render, and Jest can mock it)
const PdfDocumentView = lazy(async () => require('../components/documents/PdfDocumentView'));

/**
 * #727: a signed contract or certificate on its own screen. The PDF is downloaded once (through the
 * API, into the cache) and reused by Download and Share in the header. Pinch to zoom; the page in
 * view shows at the bottom.
 */
const DocumentViewer = ({ navigation, route }: any) => {
  const contract: IContractListItem = route.params.contract;
  const { t } = useTranslation('documents');
  const insets = useSafeAreaInsets();
  useFocusedStatusBarStyle('dark');
  const { downloadingId, download, sharingId, share } = useDownloadContract();
  const [attempt, setAttempt] = useState(0);
  const [uri, setUri] = useState<string>();
  const [failed, setFailed] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  // the OS can clear the cache under the open viewer: one fresh download, then the error
  const redownloaded = useRef(false);

  useEffect(() => {
    let active = true;
    setFailed(false);
    setUri(undefined);
    fetchContractFile(contract)
      .then((file) => active && setUri(file))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [attempt, contract]);

  const onRenderError = async () => {
    if (redownloaded.current) {
      setFailed(true);
      return;
    }
    redownloaded.current = true;
    await FileSystem.deleteAsync(contractCachePath(contract), { idempotent: true }).catch(
      () => undefined,
    );
    setAttempt((value) => value + 1);
  };

  const prefix = t(
    contract.type === DocumentType.CERTIFICATE ? 'certificate_prefix' : 'contract_prefix',
  );
  const title = contract.contractNumber ? `${prefix} ${contract.contractNumber}` : `${prefix}`;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]} testID="document-viewer">
      <PushedHeader
        title={title}
        onBack={navigation.goBack}
        backTestID="document-viewer-back"
        right={
          <View style={styles.actions}>
            <DocumentActionButton
              icon={DownloadIcon}
              tone="white"
              onPress={() => download(contract)}
              busy={downloadingId === contract.id}
              accessibilityLabel={`${t('viewer.download')}`}
              testID="document-viewer-download"
            />
            <DocumentActionButton
              icon={Platform.OS === 'ios' ? ShareIcon : ShareAndroidIcon}
              tone="white"
              onPress={() => share(contract)}
              busy={sharingId === contract.id}
              accessibilityLabel={`${t('viewer.share')}`}
              testID="document-viewer-share"
            />
          </View>
        }
      />
      <View style={styles.body}>
        {failed ? (
          <EmptyState
            title={`${t('viewer.error')}`}
            error
            actionLabel={`${t('viewer.retry')}`}
            onAction={() => {
              redownloaded.current = false;
              setAttempt((value) => value + 1);
            }}
            testID="document-viewer-error"
          />
        ) : !uri ? (
          <ActivityIndicator
            color={palette.navy}
            style={styles.loading}
            testID="document-viewer-loading"
          />
        ) : (
          <Suspense fallback={<ActivityIndicator color={palette.navy} style={styles.loading} />}>
            <PdfDocumentView
              uri={uri}
              onPages={setTotal}
              onPage={setPage}
              onError={onRenderError}
            />
          </Suspense>
        )}
        {total > 0 && !failed && (
          <View
            style={[styles.pill, { bottom: insets.bottom + 16 }]}
            accessible
            accessibilityLabel={`${t('viewer.page_a11y', { page, total })}`}
            accessibilityLiveRegion="polite"
            testID="document-viewer-page"
          >
            <AppText variant="label" color={palette.white} style={styles.pillText}>
              {t('viewer.page', { page, total })}
            </AppText>
          </View>
        )}
      </View>
    </View>
  );
};

export default DocumentViewer;

const styles = StyleSheet.create((theme) => ({
  screen: { flex: 1, backgroundColor: theme.colors.background },
  actions: { flexDirection: 'row', gap: theme.space.s },
  body: { flex: 1 },
  loading: { marginTop: 48 },
  pill: {
    position: 'absolute',
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(1,52,79,0.86)',
  },
  pillText: { fontVariant: ['tabular-nums'] },
}));
