import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { shareAsync } from 'expo-sharing';
import { IContractListItem } from '../interfaces/contract-list-item.interface';
import { endSessionIfRefused, refreshAccessToken } from '../../services/api';
import {
  clearContractFiles,
  downloadContract,
  fetchContractFile,
  shareContract,
} from './download-contract';

jest.mock('expo-file-system/legacy', () => ({
  cacheDirectory: 'file:///cache/',
  getInfoAsync: jest.fn(async () => ({ exists: false })),
  makeDirectoryAsync: jest.fn(async () => undefined),
  downloadAsync: jest.fn(),
  moveAsync: jest.fn(async () => undefined),
  deleteAsync: jest.fn(async () => undefined),
}));
jest.mock('expo-sharing', () => ({ shareAsync: jest.fn(async () => undefined) }));

let mockToken = 'old';
jest.mock('../../services/api', () => ({
  getAuthHeaders: jest.fn(async () => ({
    'x-app-version': '2.0.0',
    Authorization: `Bearer ${mockToken}`,
  })),
  refreshAccessToken: jest.fn(async () => {
    mockToken = 'new';
    return 'new';
  }),
  endSessionIfRefused: jest.fn(async () => undefined),
}));

process.env.EXPO_PUBLIC_API_URL = 'http://api.test';

const contract = {
  id: 'c1',
  path: 'https://s3.test/contract.pdf?signed',
  contractFileName: 'Contract_12/2026.pdf',
} as IContractListItem;
const target = 'file:///cache/contracts/c1/Contract_12-2026.pdf';
const part = `${target}.part`;
const fileUrl = 'http://api.test/mobile/contract/c1/file';

const answer = (...statuses: number[]) => {
  for (const status of statuses) {
    jest
      .mocked(FileSystem.downloadAsync)
      .mockResolvedValueOnce({ uri: part, status } as FileSystem.FileSystemDownloadResult);
  }
};

beforeEach(() => {
  jest.clearAllMocks();
  mockToken = 'old';
  jest.replaceProperty(Platform, 'OS', 'ios');
});
afterEach(() => jest.restoreAllMocks());

describe('fetchContractFile (#727)', () => {
  it('downloads through the API with the session headers, into the cache', async () => {
    answer(200);

    await expect(fetchContractFile(contract)).resolves.toBe(target);

    expect(FileSystem.downloadAsync).toHaveBeenCalledWith(fileUrl, part, {
      headers: { 'x-app-version': '2.0.0', Authorization: 'Bearer old' },
    });
    expect(FileSystem.moveAsync).toHaveBeenCalledWith({ from: part, to: target });
  });

  it('reuses the cached file without a request', async () => {
    jest
      .mocked(FileSystem.getInfoAsync)
      .mockResolvedValueOnce({ exists: true, isDirectory: false, size: 2252 } as never);

    await expect(fetchContractFile(contract)).resolves.toBe(target);
    expect(FileSystem.downloadAsync).not.toHaveBeenCalled();
  });

  it('downloads once when the viewer and a button ask at the same time', async () => {
    answer(200);
    const [first, second] = await Promise.all([
      fetchContractFile(contract),
      fetchContractFile(contract),
    ]);
    expect(first).toBe(target);
    expect(second).toBe(target);
    expect(FileSystem.downloadAsync).toHaveBeenCalledTimes(1);
  });

  it('refreshes an expired access token once and retries', async () => {
    answer(401, 200);

    await expect(fetchContractFile(contract)).resolves.toBe(target);

    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(FileSystem.downloadAsync).toHaveBeenLastCalledWith(fileUrl, part, {
      headers: { 'x-app-version': '2.0.0', Authorization: 'Bearer new' },
    });
  });

  it('ends the session when the refresh is refused', async () => {
    answer(401);
    const refused = new Error('refused');
    jest.mocked(refreshAccessToken).mockRejectedValueOnce(refused);

    await expect(fetchContractFile(contract)).rejects.toBe(refused);
    expect(endSessionIfRefused).toHaveBeenCalledWith(refused);
  });

  it('falls back to the presigned link when the backend has no file route yet', async () => {
    answer(404, 200);

    await expect(fetchContractFile(contract)).resolves.toBe(target);
    expect(FileSystem.downloadAsync).toHaveBeenLastCalledWith(contract.path, part);
  });

  it.each([403, 500])('rejects HTTP %i and deletes the partial file', async (status) => {
    answer(status);

    await expect(fetchContractFile(contract)).rejects.toThrow(
      `Contract download failed (${status})`,
    );
    expect(FileSystem.deleteAsync).toHaveBeenCalledWith(part, { idempotent: true });
    expect(FileSystem.moveAsync).not.toHaveBeenCalled();
  });
});

describe('downloadContract and shareContract', () => {
  it('shares the cached PDF on iPhone (Download opens the share sheet there)', async () => {
    answer(200);
    await downloadContract(contract);
    expect(shareAsync).toHaveBeenCalledWith(target, {
      mimeType: 'application/pdf',
      UTI: 'com.adobe.pdf',
    });
  });

  it('shares a Word contract with its own type', async () => {
    answer(200);
    await shareContract({ ...contract, id: 'c2', contractFileName: 'Contract_1.docx' });
    expect(shareAsync).toHaveBeenCalledWith(
      'file:///cache/contracts/c2/Contract_1.docx',
      expect.objectContaining({
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      }),
    );
  });

  it('does not share when the download failed', async () => {
    answer(500);
    await expect(shareContract(contract)).rejects.toThrow('Contract download failed (500)');
    expect(shareAsync).not.toHaveBeenCalled();
  });
});

it('clears the downloaded contracts on logout', async () => {
  await clearContractFiles();
  expect(FileSystem.deleteAsync).toHaveBeenCalledWith('file:///cache/contracts/', {
    idempotent: true,
  });
});
