import { useCallback, useState } from 'react';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { downloadContract, shareContract } from '../../common/utils/download-contract';
import { IContractListItem } from '../../common/interfaces/contract-list-item.interface';

/**
 * Downloads or shares a signed contract, remembers which one is busy and shows a toast on failure.
 * #727: both reuse the file the viewer already downloaded.
 */
export const useDownloadContract = () => {
  const { t } = useTranslation('documents');
  const [downloadingId, setDownloadingId] = useState<string>();
  const [sharingId, setSharingId] = useState<string>();

  const run = useCallback(
    async (
      contract: IContractListItem,
      action: (contract: IContractListItem) => Promise<void>,
      setBusy: (id?: string) => void,
    ) => {
      setBusy(contract.id);
      try {
        await action(contract);
      } catch {
        Toast.show({ type: 'error', text1: `${t('download_error')}` });
      } finally {
        setBusy(undefined);
      }
    },
    [t],
  );

  const download = useCallback(
    (contract: IContractListItem) => run(contract, downloadContract, setDownloadingId),
    [run],
  );
  const share = useCallback(
    (contract: IContractListItem) => run(contract, shareContract, setSharingId),
    [run],
  );

  return { downloadingId, download, sharingId, share };
};
