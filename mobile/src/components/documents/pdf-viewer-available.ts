import { TurboModuleRegistry } from 'react-native';

// #727: the viewer needs native code that binaries built before it do not have. JavaScript
// published over the air to such a binary must not open it: a tap downloads the file instead.
export const isPdfViewerAvailable = (): boolean => {
  try {
    return TurboModuleRegistry.get('ReactNativeBlobUtil') != null;
  } catch {
    return false;
  }
};
