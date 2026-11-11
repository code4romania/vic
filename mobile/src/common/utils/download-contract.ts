import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { shareAsync } from 'expo-sharing';
import { MIME_TYPES } from '../constants/constants';
import { IContractListItem } from '../interfaces/contract-list-item.interface';
import { sanitizeFileName } from './sanitize-file-name';

const save = async (uri: string, fileName: string, mimetype: string) => {
  // Android 11+ can write to a folder the user picks; everywhere else we open the share sheet
  if (Platform.OS === 'android' && Number(Platform.Version) >= 30) {
    const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
    if (permissions.granted) {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const resultUri = await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        fileName,
        mimetype,
      );
      await FileSystem.writeAsStringAsync(resultUri, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      return;
    }
  }
  await shareAsync(uri);
};

/** Downloads a signed contract and saves or shares it (was duplicated in Documents and ContractHistory). */
export const downloadContract = async (contract: IContractListItem) => {
  const fileName = sanitizeFileName(contract.contractFileName);
  const localPath = `${FileSystem.documentDirectory}${fileName}`;
  const file = await FileSystem.downloadAsync(contract.path, localPath);
  const extension = fileName.split('.').pop() as string;
  await save(file.uri, fileName, MIME_TYPES[extension] as string);
};
