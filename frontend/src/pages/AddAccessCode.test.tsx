import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import AddAccessCode from './AddAccessCode';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';

it.each([null, '2026-11-01T10:00:00Z'])('gates access-code creation for validatedAt=%s', async (validatedAt) => {
  server.use(http.get(api('/organization'), () => HttpResponse.json({ id: 'org-1', validatedAt })));
  const { queryClient } = renderPage(<AddAccessCode />);
  await waitFor(() => expect(queryClient.getQueryData(['organization'])).toBeDefined());
  const button = screen.getByRole('button', { name: t('general:save_changes') });
  if (validatedAt) {
    expect(button).toBeEnabled();
    expect(button).not.toHaveAttribute('title');
  } else {
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('title', t('organization:validation_required'));
  }
});
