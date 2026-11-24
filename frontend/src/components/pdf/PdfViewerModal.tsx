import React, { Fragment, Suspense, lazy, useEffect, useRef, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  ArrowDownTrayIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon,
  PrinterIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import i18n from '../../common/config/i18n';
import { downloadBlob } from '../../common/utils/utils';
import EmptyContent from '../EmptyContent';
import Button from '../Button';
import LoadingContent from '../LoadingContent';

const PdfDocument = lazy(() => import('./PdfDocument'));

const t = (key: string, options?: Record<string, unknown>): string =>
  `${i18n.t(`documents:viewer.${key}`, options)}`;

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 3;
const ZOOM_STEP = 0.25;

// Android Chrome and other phone browsers cannot print an embedded PDF; Print is a desktop action
const canPrint = (): boolean =>
  typeof window !== 'undefined' &&
  (navigator as Navigator & { pdfViewerEnabled?: boolean }).pdfViewerEnabled !== false;

const asPdf = (blob: Blob): Blob =>
  blob.type === 'application/pdf' ? blob : new Blob([blob], { type: 'application/pdf' });

export interface PdfViewerModalProps {
  fileName: string;
  // fetches the file once when the viewer opens (or returns a PDF generated just before)
  load: () => Promise<Blob>;
  onClose: () => void;
}

// #726: a PDF opened over the page, with Download always in the header. Opens on top of other modals
// (Headless UI keeps Escape and focus with the dialog opened last).
const PdfViewerModal = ({ fileName, load, onClose }: PdfViewerModalProps) => {
  const loader = useRef(load);
  const printFrame = useRef<HTMLIFrameElement | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [file, setFile] = useState<Blob | null>(null);
  const [failed, setFailed] = useState(false);
  const [unreadable, setUnreadable] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let active = true;
    setFailed(false);
    loader
      .current()
      .then((blob) => active && setFile(asPdf(blob)))
      .catch(() => active && setFailed(true));
    return () => {
      active = false;
    };
  }, [attempt]);

  // the hidden print frame lives as long as the viewer
  useEffect(
    () => () => {
      if (printFrame.current) {
        URL.revokeObjectURL(printFrame.current.src);
        printFrame.current.remove();
      }
    },
    [],
  );

  const onDownload = () => file && downloadBlob(file, fileName);

  const onPrint = () => {
    if (!file) return;
    if (printFrame.current) {
      printFrame.current.contentWindow?.print();
      return;
    }
    const frame = document.createElement('iframe');
    frame.setAttribute('aria-hidden', 'true');
    frame.style.cssText = 'position:fixed;right:0;bottom:0;width:0;height:0;border:0;';
    frame.onload = () => {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
    };
    frame.src = URL.createObjectURL(file);
    document.body.appendChild(frame);
    printFrame.current = frame;
  };

  const iconButton =
    'flex items-center gap-1.5 p-2 rounded-lg text-cool-gray-700 hover:bg-cool-gray-100 disabled:opacity-40 disabled:hover:bg-transparent focus:outline-none focus-visible:shadow-focus';

  return (
    <Transition.Root show={true} as={Fragment}>
      <Dialog as="div" className="relative z-20" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-cool-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>
        <Dialog.Panel
          className="fixed inset-0 sm:inset-4 lg:inset-8 flex flex-col bg-white sm:rounded-lg shadow-section overflow-hidden"
          data-testid="pdf-viewer"
        >
          <div className="flex items-center gap-1 sm:gap-2 border-b border-cool-gray-200 px-3 py-2 sm:px-4">
            <Dialog.Title
              as="h3"
              className="flex-1 min-w-0 truncate !text-base sm:!text-lg !font-titilliumBold text-cool-gray-900"
              title={fileName}
            >
              {fileName}
            </Dialog.Title>
            {total > 0 && (
              <span
                className="hidden sm:block px-2 text-sm text-cool-gray-500 tabular-nums"
                aria-live="polite"
                aria-label={t('page_label', { page, total })}
              >
                {t('page_of', { page, total })}
              </span>
            )}
            <button
              type="button"
              className={iconButton}
              aria-label={t('zoom_out')}
              title={t('zoom_out')}
              disabled={!file || unreadable || zoom <= ZOOM_MIN}
              onClick={() => setZoom((value) => Math.max(ZOOM_MIN, value - ZOOM_STEP))}
            >
              <MagnifyingGlassMinusIcon className="w-5 h-5" aria-hidden="true" />
            </button>
            <span className="hidden md:block w-12 text-center text-sm text-cool-gray-500 tabular-nums">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              className={iconButton}
              aria-label={t('zoom_in')}
              title={t('zoom_in')}
              disabled={!file || unreadable || zoom >= ZOOM_MAX}
              onClick={() => setZoom((value) => Math.min(ZOOM_MAX, value + ZOOM_STEP))}
            >
              <MagnifyingGlassPlusIcon className="w-5 h-5" aria-hidden="true" />
            </button>
            {canPrint() && (
              <button
                type="button"
                className={`${iconButton} hidden lg:flex`}
                disabled={!file || unreadable}
                onClick={onPrint}
              >
                <PrinterIcon className="w-5 h-5" aria-hidden="true" />
                <span className="text-sm font-robotoMedium">{t('print')}</span>
              </button>
            )}
            <button
              type="button"
              className="btn-primary flex items-center gap-1.5 !px-3 !py-2"
              disabled={!file}
              onClick={onDownload}
              aria-label={`${t('download')} ${fileName}`}
            >
              <ArrowDownTrayIcon className="w-5 h-5" aria-hidden="true" />
              <span className="sr-only sm:not-sr-only">{t('download')}</span>
            </button>
            <button
              type="button"
              className={iconButton}
              aria-label={`${i18n.t('general:close')}`}
              onClick={onClose}
            >
              <XMarkIcon className="w-6 h-6" aria-hidden="true" />
            </button>
          </div>
          <div className="relative flex-1 min-h-0">
            {failed ? (
              <div className="p-6">
                <EmptyContent
                  error
                  title={t('error_title')}
                  description={t('error')}
                  action={
                    <Button
                      type="button"
                      label={`${i18n.t('states:retry')}`}
                      className="btn-outline-secondary"
                      onClick={() => setAttempt((value) => value + 1)}
                    />
                  }
                />
              </div>
            ) : !file ? (
              <LoadingContent />
            ) : unreadable ? (
              <div className="p-6">
                <EmptyContent description={t('render_error')} />
              </div>
            ) : (
              <Suspense fallback={<LoadingContent />}>
                <PdfDocument
                  file={file}
                  zoom={zoom}
                  onPages={setTotal}
                  onPage={setPage}
                  onError={() => setUnreadable(true)}
                />
              </Suspense>
            )}
            {total > 0 && !unreadable && (
              <span
                className="sm:hidden absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-cool-gray-900/80 px-3 py-1 text-sm text-white tabular-nums"
                aria-hidden="true"
              >
                {t('page_of', { page, total })}
              </span>
            )}
          </div>
        </Dialog.Panel>
      </Dialog>
    </Transition.Root>
  );
};

export default PdfViewerModal;
