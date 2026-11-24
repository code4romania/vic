import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { shareAsync } from 'expo-sharing';
import { endSessionIfRefused, getAuthHeaders, refreshAccessToken } from '../../services/api';
import { MIME_TYPES } from '../constants/constants';
import { IContractListItem } from '../interfaces/contract-list-item.interface';
import { sanitizeFileName } from './sanitize-file-name';

// #727: each contract is downloaded once into the cache and reused by the viewer, Download and
// Share. The OS may clear the cache at any time, so every use checks the file is still there.
export const CONTRACTS_CACHE_DIR = `${FileSystem.cacheDirectory}contracts/`;

const fileNameOf = (contract: IContractListItem): string =>
  sanitizeFileName(contract.contractFileName);

const mimeTypeOf = (fileName: string): string =>
  MIME_TYPES[fileName.split('.').pop()?.toLowerCase() as string] ?? 'application/octet-stream';

export const contractCachePath = (contract: IContractListItem): string =>
  `${CONTRACTS_CACHE_DIR}${contract.id}/${fileNameOf(contract)}`;

const isOk = (status: number): boolean => status >= 200 && status < 300;

const fileUrl = (contract: IContractListItem): string =>
  `${process.env.EXPO_PUBLIC_API_URL}/mobile/contract/${contract.id}/file`;

const downloadOnce = async (contract: IContractListItem, part: string) => {
  const url = fileUrl(contract);
  let result = await FileSystem.downloadAsync(url, part, { headers: await getAuthHeaders() });
  if (result.status === 401) {
    // an expired access token: refresh once (shared with the axios client) and retry
    try {
      await refreshAccessToken();
    } catch (error) {
      await endSessionIfRefused(error);
      throw error;
    }
    result = await FileSystem.downloadAsync(url, part, { headers: await getAuthHeaders() });
  }
  // a backend without the file route yet: the presigned link from the list still works
  if (result.status === 404 && contract.path) {
    result = await FileSystem.downloadAsync(contract.path, part);
  }
  return result;
};

const inFlight = new Map<string, Promise<string>>();

/** The contract's file on the phone (file:// URI), downloaded through the API when not cached. */
export const fetchContractFile = (contract: IContractListItem): Promise<string> => {
  const pending = inFlight.get(contract.id);
  if (pending) {
    return pending;
  }

  const promise = (async () => {
    const target = contractCachePath(contract);
    const cached = await FileSystem.getInfoAsync(target);
    if (cached.exists && !cached.isDirectory && cached.size) {
      return target;
    }

    await FileSystem.makeDirectoryAsync(`${CONTRACTS_CACHE_DIR}${contract.id}/`, {
      intermediates: true,
    });
    const part = `${target}.part`;
    const file = await downloadOnce(contract, part);
    if (!isOk(file.status)) {
      await FileSystem.deleteAsync(part, { idempotent: true }).catch(() => undefined);
      throw new Error(`Contract download failed (${file.status})`);
    }
    await FileSystem.deleteAsync(target, { idempotent: true }).catch(() => undefined);
    await FileSystem.moveAsync({ from: part, to: target });
    return target;
  })().finally(() => inFlight.delete(contract.id));

  inFlight.set(contract.id, promise);
  return promise;
};

/** Android 11+ writes to a folder the user picks; everywhere else (and on cancel) the share sheet. */
export const saveContractToDevice = async (uri: string, fileName: string): Promise<void> => {
  const mimeType = mimeTypeOf(fileName);
  if (Platform.OS === 'android' && Number(Platform.Version) >= 30) {
    const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (permissions.granted) {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const resultUri = await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        fileName,
        mimeType,
      );
      await FileSystem.writeAsStringAsync(resultUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return;
    }
  }
  await shareAsync(uri, {
    mimeType,
    UTI: mimeType === 'application/pdf' ? 'com.adobe.pdf' : undefined,
  });
};

/** The system share sheet with the file (send it, or "Save to Files" on iPhone). */
export const shareContractFile = async (uri: string, fileName: string): Promise<void> => {
  const mimeType = mimeTypeOf(fileName);
  await shareAsync(uri, {
    mimeType,
    UTI: mimeType === 'application/pdf' ? 'com.adobe.pdf' : undefined,
  });
};

/** Downloads a signed contract (or reuses the cached copy) and saves or shares it. */
export const downloadContract = async (contract: IContractListItem): Promise<void> => {
  const uri = await fetchContractFile(contract);
  await saveContractToDevice(uri, fileNameOf(contract));
};

/** Shares a signed contract (downloading it first when needed). */
export const shareContract = async (contract: IContractListItem): Promise<void> => {
  const uri = await fetchContractFile(contract);
  await shareContractFile(uri, fileNameOf(contract));
};

/** On logout: the next account on this phone must not find the previous one's contracts. */
export const clearContractFiles = (): Promise<void> =>
  FileSystem.deleteAsync(CONTRACTS_CACHE_DIR, { idempotent: true }).catch(() => undefined);
