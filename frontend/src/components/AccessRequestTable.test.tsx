import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, useLocation } from 'react-router-dom';
import { http, HttpResponse } from 'msw';
import AccessRequestTable from './AccessRequestTable';
import { RequestStatus } from '../common/enums/request-status.enum';
import {
  useApprovedAccessRequestsQuery,
  useNewAccessRequestsQuery,
  useRejectedAccessRequestsQuery,
} from '../services/access-requests/access-requests.service';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';

const DetailLocation = () => <output>{useLocation().pathname}</output>;

const show = (status: RequestStatus) => {
  const queries = {
    [RequestStatus.PENDING]: { endpoint: 'new', hook: useNewAccessRequestsQuery },
    [RequestStatus.APPROVED]: { endpoint: 'approved', hook: useApprovedAccessRequestsQuery },
    [RequestStatus.REJECTED]: { endpoint: 'rejected', hook: useRejectedAccessRequestsQuery },
  };
  const { endpoint, hook } = queries[status];
  server.use(
    http.get(api(`/access-request/${endpoint}`), () =>
      HttpResponse.json({
        items: [
          {
            id: 'ar-1',
            status,
            createdOn: '2026-11-01T10:00:00.000Z',
            updatedOn: '2026-11-02T10:00:00.000Z',
            requestedBy: {
              name: 'Elena Pop',
              email: 'elena@example.ro',
              phone: '+40722000000',
              location: null,
              profilePicture: '',
            },
          },
        ],
        meta: { itemCount: 1, totalItems: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
      }),
    ),
  );
  renderPage(
    <AccessRequestTable
      status={status}
      useAccessRequests={hook}
      query={{ limit: 10, page: 1 }}
      setQuery={vi.fn()}
    />,
    {
      route: '/approvals/volunteers',
      path: '/approvals/volunteers',
      routes: <Route path="/volunteers/requests/:id" element={<DetailLocation />} />,
    },
  );
};

describe('AccessRequestTable navigation', () => {
  it('opens the existing detail route when reviewing a pending request', async () => {
    show(RequestStatus.PENDING);

    await userEvent.click(
      await screen.findByRole('button', { name: `${t('approvals:review')} Elena Pop` }),
    );

    expect(screen.getByRole('status')).toHaveTextContent('/volunteers/requests/ar-1');
  });

  it.each([RequestStatus.PENDING, RequestStatus.APPROVED, RequestStatus.REJECTED])(
    'opens the existing detail route from the %s request row menu',
    async (status) => {
      show(status);

      await userEvent.click(await screen.findByRole('button', { name: t('general:actions') }));
      await userEvent.click(
        await screen.findByRole('button', { name: t('access_requests:popover.view') }),
      );

      expect(screen.getByRole('status')).toHaveTextContent('/volunteers/requests/ar-1');
    },
  );
});
