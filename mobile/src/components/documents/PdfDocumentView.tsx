import React from 'react';
import { View } from 'react-native';
import Pdf from 'react-native-pdf';
import { StyleSheet } from 'react-native-unistyles';

export interface PdfDocumentViewProps {
  uri: string;
  onPages: (total: number) => void;
  onPage: (page: number) => void;
  onError: () => void;
}

// #727: the only module that loads react-native-pdf (DocumentViewer imports it lazily, after
// isPdfViewerAvailable). Pinch to zoom up to 4×, pages one under the other.
const PdfDocumentView = ({ uri, onPages, onPage, onError }: PdfDocumentViewProps) => (
  <View style={styles.pdf} testID="pdf-document">
    <Pdf
      source={{ uri }}
      style={styles.pdf}
      minScale={1}
      maxScale={4}
      spacing={12}
      fitPolicy={0}
      trustAllCerts={false}
      enableAnnotationRendering={false}
      onLoadComplete={(total) => onPages(total)}
      onPageChanged={(page) => onPage(page)}
      onError={onError}
    />
  </View>
);

export default PdfDocumentView;

const styles = StyleSheet.create((theme) => ({
  pdf: { flex: 1, backgroundColor: theme.colors.background },
}));
