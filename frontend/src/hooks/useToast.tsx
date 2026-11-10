import React from 'react';
import { toast, ToastOptions } from 'react-toastify';
import { CheckCircleIcon, InformationCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

type ToastTone = 'success' | 'error' | 'info';

const ICONS: Record<ToastTone, React.ReactElement> = {
  success: <CheckCircleIcon className="w-6 h-6 text-figure-green" aria-hidden="true" />,
  error: <XCircleIcon className="w-6 h-6 text-figure-red" aria-hidden="true" />,
  info: <InformationCircleIcon className="w-6 h-6 text-navy" aria-hidden="true" />,
};

const EDGES: Record<ToastTone, string> = {
  success: '!border-l-figure-green',
  error: '!border-l-figure-red',
  info: '!border-l-navy',
};

// Long enough to read, short enough not to stay over the page: errors a bit longer than the rest
export const TOAST_DURATION: Record<ToastTone, number> = {
  success: 5000,
  info: 6000,
  error: 8000,
};

// White card with a colored edge and icon, like the rest of the app (no colored blocks, no CSS file).
export const toastOptions = (tone: ToastTone): ToastOptions => ({
  icon: ICONS[tone],
  theme: 'light',
  hideProgressBar: true,
  autoClose: TOAST_DURATION[tone],
  className: `!rounded-xl !border !border-l-4 !border-cool-gray-200 ${EDGES[tone]} !shadow-menu !font-roboto !text-sm !text-cool-gray-900 !min-h-[56px]`,
  bodyClassName: '!items-center !gap-1 !p-1',
});

const useErrorToast = (message: string, id?: string) => {
  const errorToastId = id || 'errorToast';

  if (toast.isActive(errorToastId)) {
    toast.dismiss(errorToastId);
  }

  toast.error(message, { ...toastOptions('error'), toastId: errorToastId });
};

const useSuccessToast = (message: string) => {
  const successToastId = 'successToast';

  if (toast.isActive(successToastId)) {
    toast.dismiss(successToastId);
  }

  toast.success(message, { ...toastOptions('success'), toastId: successToastId });
};

export { useErrorToast, useSuccessToast };
