import React from 'react';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import ContractsTableWithQueryParams from './ContractsTableWithQueryParams';
import { renderPage } from '../../test/render';
import { api, server } from '../../test/server';

vi.mock('../../hooks/useToast', () => ({ useErrorToast: vi.fn(), useSuccessToast: vi.fn() }));

const one = {
  items: [
    {
      id: 'c1',
      contractNumber: '7/2026',
      volunteer: { id: 'v1', name: 'Elena Pop' },
      status: 'SIGNED',
      expiringSoon: false,
      startDate: '2026-01-01T00:00:00.000Z',
      endDate: null,
      fileName: 'Contract_7.pdf',
      uri: 'https://files/c1.pdf',
    },
  ],
  meta: { itemCount: 1, totalItems: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
};

describe('ContractsTableWithQueryParams (#681)', () => {
  let sent: URLSearchParams[] = [];

  beforeEach(() => {
    sent = [];
    server.use(
      http.get(api('/contract'), ({ request }) => {
        sent.push(new URL(request.url).searchParams);
        return HttpResponse.json(one);
      }),
    );
  });

  const render = (route: string) =>
    renderPage(
      // StrictMode like main.tsx: the table's sort call on load only shows up there
      <React.StrictMode>
        <QueryParamProvider adapter={ReactRouter6Adapter}>
          <ContractsTableWithQueryParams />
        </QueryParamProvider>
      </React.StrictMode>,
      { route },
    );

  it('asks for the newest contracts first, so an upload shows at the top', async () => {
    render('/documents/contracts');
    // the table's own sort call, once the rows are in, must not turn the order around
    expect(await screen.findByText('Elena Pop')).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(sent.map((params) => params.get('orderDirection'))).not.toContain('ASC');
    expect(sent.at(-1)?.get('orderBy')).toBe('createdOn');
    expect(sent.at(-1)?.get('orderDirection')).toBe('DESC');
  });

  it('keeps an order the admin picked', async () => {
    render('/documents/contracts?orderBy=startDate&orderDirection=ASC');
    expect(await screen.findByText('Elena Pop')).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(sent.at(-1)?.get('orderBy')).toBe('startDate');
    expect(sent.at(-1)?.get('orderDirection')).toBe('ASC');
  });
});
