import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import LoadingContent from '../LoadingContent';

// The only module that loads pdf.js (#726): PdfViewerModal imports it lazily, so the library and its
// worker are fetched the first time someone opens a document.
pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

// stable reference: react-pdf reloads the document when options change
const OPTIONS = { isEvalSupported: false };
// pages farther than this from the one in view are placeholders of the same height
const RENDER_AROUND = 2;
const MAX_PAGE_WIDTH = 900;
const A4_RATIO = 297 / 210;

export interface PdfDocumentProps {
  file: Blob;
  zoom: number;
  onPages: (total: number) => void;
  onPage: (page: number) => void;
  onError: () => void;
}

const PdfDocument = ({ file, zoom, onPages, onPage, onError }: PdfDocumentProps) => {
  const scroller = useRef<HTMLDivElement>(null);
  const pages = useRef<(HTMLDivElement | null)[]>([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
  const [available, setAvailable] = useState(0);
  const [ratio, setRatio] = useState(A4_RATIO);

  // the page width follows the modal; zoom multiplies it
  useEffect(() => {
    const element = scroller.current;
    if (!element) return;
    const measure = () => setAvailable(element.clientWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const width = Math.max(200, Math.min(available - 32, MAX_PAGE_WIDTH)) * zoom;

  // the page in view: the last one whose top is above a third of the visible area
  const onScroll = useCallback(() => {
    const element = scroller.current;
    if (!element) return;
    const line = element.scrollTop + element.clientHeight / 3;
    let page = 1;
    pages.current.forEach((wrapper, index) => {
      if (wrapper && wrapper.offsetTop <= line) page = index + 1;
    });
    setCurrent((previous) => (previous === page ? previous : page));
  }, []);

  useEffect(() => onPage(current), [current]);

  return (
    <div
      ref={scroller}
      onScroll={onScroll}
      className="h-full overflow-auto bg-cool-gray-100"
      data-testid="pdf-scroller"
    >
      <Document
        file={file}
        options={OPTIONS}
        loading={<LoadingContent />}
        error={<span />}
        onLoadSuccess={({ numPages }) => {
          setTotal(numPages);
          onPages(numPages);
        }}
        onLoadError={onError}
        className="flex flex-col items-center gap-4 py-4 min-w-fit px-4"
      >
        {Array.from({ length: total }, (_, index) => {
          const number = index + 1;
          const near = Math.abs(number - current) <= RENDER_AROUND;
          return (
            <div
              key={number}
              ref={(element) => {
                pages.current[index] = element;
              }}
              className="bg-white shadow-section"
              style={{ width, minHeight: near ? undefined : width * ratio }}
            >
              {near && (
                <Page
                  pageNumber={number}
                  width={width}
                  devicePixelRatio={Math.min(2, window.devicePixelRatio || 1)}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  loading={<div style={{ height: width * ratio }} />}
                  onLoadSuccess={(page) => {
                    if (number === 1 && page.originalWidth) {
                      setRatio(page.originalHeight / page.originalWidth);
                    }
                  }}
                />
              )}
            </div>
          );
        })}
      </Document>
    </div>
  );
};

export default PdfDocument;
