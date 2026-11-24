import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import '../common/config/i18n';
import DocumentViewer from './DocumentViewer';

// #727: the viewer screen. react-native-pdf is native: a stand-in reports the pages and can fail.
const mockFetch = jest.fn();
const mockDownload = jest.fn();
const mockShare = jest.fn();
jest.mock('../common/utils/download-contract', () => ({
  fetchContractFile: (...args: any[]) => mockFetch(...args),
  contractCachePath: () => 'file:///cache/contracts/c1/Contract_1.pdf',
  downloadContract: (...args: any[]) => mockDownload(...args),
  shareContract: (...args: any[]) => mockShare(...args),
}));
jest.mock('expo-file-system/legacy', () => ({ deleteAsync: jest.fn(async () => undefined) }));

let mockRenderFails = false;
jest.mock('../components/documents/PdfDocumentView', () => {
  const { useEffect } = require('react');
  const { Text } = require('react-native');
  const PdfStandIn = ({ uri, onPages, onPage, onError }: any) => {
    useEffect(() => {
      if (mockRenderFails) {
        onError();
        return;
      }
      onPages(5);
      onPage(2);
    }, [uri, onPages, onPage, onError]);
    return <Text testID="pdf-document">{uri}</Text>;
  };
  return { __esModule: true, default: PdfStandIn };
});

const contract = {
  id: 'c1',
  contractNumber: '1/2026',
  contractFileName: 'Contract_1.pdf',
  path: 'https://s3.test/c1.pdf',
};

const { Navigator, Screen } = createNativeStackNavigator();
const renderViewer = () =>
  render(
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 },
      }}
    >
      <NavigationContainer>
        <Navigator screenOptions={{ headerShown: false }}>
          <Screen name="document-viewer" component={DocumentViewer} initialParams={{ contract }} />
        </Navigator>
      </NavigationContainer>
    </SafeAreaProvider>,
  );

beforeEach(() => {
  jest.clearAllMocks();
  mockRenderFails = false;
  mockFetch.mockResolvedValue('file:///cache/contracts/c1/Contract_1.pdf');
  mockDownload.mockResolvedValue(undefined);
  mockShare.mockResolvedValue(undefined);
});

describe('DocumentViewer (#727)', () => {
  it('shows the PDF with the page in view, titled like its card', async () => {
    await renderViewer();

    expect(await screen.findByTestId('pdf-document')).toHaveTextContent(
      'file:///cache/contracts/c1/Contract_1.pdf',
    );
    expect(screen.getByText('Contract 1/2026')).toBeTruthy();
    expect(screen.getByTestId('document-viewer-page')).toHaveTextContent('2 / 5');
    expect(screen.getByTestId('document-viewer-page').props.accessibilityLabel).toBe(
      'Pagina 2 din 5',
    );
    expect(mockFetch).toHaveBeenCalledWith(expect.objectContaining({ id: 'c1' }));
  });

  it('downloads and shares the same contract from the header', async () => {
    await renderViewer();
    await screen.findByTestId('pdf-document');

    await fireEvent.press(screen.getByLabelText('Descarcă'));
    expect(mockDownload).toHaveBeenCalledWith(expect.objectContaining({ id: 'c1' }));
    await fireEvent.press(screen.getByLabelText('Partajează'));
    expect(mockShare).toHaveBeenCalledWith(expect.objectContaining({ id: 'c1' }));
  });

  it('says when the file cannot be downloaded, and tries again', async () => {
    mockFetch.mockRejectedValueOnce(new Error('offline'));
    await renderViewer();

    expect(await screen.findByText('Nu am putut deschide documentul.')).toBeTruthy();
    expect(screen.queryByTestId('document-viewer-page')).toBeNull();
    await fireEvent.press(screen.getByText('Încearcă din nou'));
    expect(await screen.findByTestId('pdf-document')).toBeTruthy();
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('downloads again once when the cached file cannot be read, then gives up', async () => {
    mockRenderFails = true;
    await renderViewer();

    expect(await screen.findByText('Nu am putut deschide documentul.')).toBeTruthy();
    await waitFor(() => expect(mockFetch).toHaveBeenCalledTimes(2));
  });
});
