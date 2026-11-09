import { useCallback, useState } from 'react';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { downloadContract } from '../../common/utils/download-contract';
import { IContractListItem } from '../../common/interfaces/contract-list-item.interface';

/** Downloads a signed contract, remembers which one is downloading and shows a toast on failure. */
export const useDownloadContract = () => {
  const { t } = useTranslation('documents');
  const [downloadingId, setDownloadingId] = useState<string>();
  const download = useCallback(
    async (contract: IContractListItem) => {
      setDownloadingId(contract.id);
      try {
        await downloadContract(contract);
      } catch {
        Toast.show({ type: 'error', text1: `${t('download_error')}` });
      } finally {
        setDownloadingId(undefined);
      }
    },
    [t],
  );
  return { downloadingId, download };
};
