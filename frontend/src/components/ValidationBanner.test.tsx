import React from 'react';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import ValidationBanner from './ValidationBanner';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';

const organization = (validatedAt: string | null) =>
  server.use(
    http.get(api('/organization'), () =>
      HttpResponse.json({ id: 'org-1', name: 'Asociatia Test', status: 'active', validatedAt }),
    ),
  );

describe('ValidationBanner', () => {
  it('shows while validatedAt is null', async () => {
    organization(null);
    renderPage(<ValidationBanner />);
    expect(await screen.findByText(t('organization:validation_banner'))).toBeInTheDocument();
  });

  it('is gone once validated', async () => {
    organization('2026-11-01T10:00:00.000Z');
    const { queryClient } = renderPage(<ValidationBanner />);
    await vi.waitFor(() => expect(queryClient.getQueryData(['organization'])).toBeDefined());
    expect(screen.queryByText(t('organization:validation_banner'))).toBeNull();
  });
});
