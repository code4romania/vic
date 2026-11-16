import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { shareAsync } from 'expo-sharing';
import { IContractListItem } from '../interfaces/contract-list-item.interface';
import { downloadContract } from './download-contract';

jest.mock('expo-file-system/legacy', () => ({
  documentDirectory: 'file:///documents/',
  downloadAsync: jest.fn(),
  deleteAsync: jest.fn(async () => undefined),
}));
jest.mock('expo-sharing', () => ({ shareAsync: jest.fn(async () => undefined) }));

const contract = {
  path: 'https://example.com/contract.pdf',
  contractFileName: 'Contract_12/2026.pdf',
} as IContractListItem;
const uri = 'file:///documents/Contract_12-2026.pdf';

beforeEach(() => {
  jest.clearAllMocks();
  jest.replaceProperty(Platform, 'OS', 'ios');
});
afterEach(() => jest.restoreAllMocks());

describe('downloadContract', () => {
  it.each([199, 300, 404, 500])(
    'rejects HTTP %i and deletes the file without sharing',
    async (status) => {
      jest
        .mocked(FileSystem.downloadAsync)
        .mockResolvedValue({ uri, status } as FileSystem.FileSystemDownloadResult);

      await expect(downloadContract(contract)).rejects.toThrow(
        `Contract download failed (${status})`,
      );

      expect(FileSystem.deleteAsync).toHaveBeenCalledWith(uri, { idempotent: true });
      expect(shareAsync).not.toHaveBeenCalled();
    },
  );

  it('still rejects the HTTP error when deleting the file fails', async () => {
    jest
      .mocked(FileSystem.downloadAsync)
      .mockResolvedValue({ uri, status: 404 } as FileSystem.FileSystemDownloadResult);
    jest.mocked(FileSystem.deleteAsync).mockRejectedValueOnce(new Error('Delete failed'));

    await expect(downloadContract(contract)).rejects.toThrow('Contract download failed (404)');
    expect(shareAsync).not.toHaveBeenCalled();
  });

  it.each([200, 299])('shares a successful HTTP %i download', async (status) => {
    jest
      .mocked(FileSystem.downloadAsync)
      .mockResolvedValue({ uri, status } as FileSystem.FileSystemDownloadResult);

    await downloadContract(contract);

    expect(FileSystem.downloadAsync).toHaveBeenCalledWith(contract.path, uri);
    expect(shareAsync).toHaveBeenCalledWith(uri);
    expect(FileSystem.deleteAsync).not.toHaveBeenCalled();
  });
});
