import { useState } from 'react';
import i18n from '../../common/config/i18n';
import { downloadBlob } from '../../common/utils/utils';
import { useErrorToast } from '../../hooks/useToast';

// #726: the Download buttons next to "Vezi" fetch the file through the API (a link to the S3 file
// would only open it) and save it under its own name.
export const useFileDownload = () => {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const download = async (id: string, load: () => Promise<Blob>, fileName: string) => {
    setDownloadingId(id);
    try {
      downloadBlob(await load(), fileName);
    } catch {
      useErrorToast(i18n.t('documents:viewer.download_error'));
    } finally {
      setDownloadingId(null);
    }
  };

  return { downloadingId, download };
};
