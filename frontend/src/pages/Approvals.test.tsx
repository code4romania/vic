import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import Approvals from './Approvals';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';

const page = {
  items: [],
  meta: { itemCount: 0, totalItems: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 },
};

const render = (route: string) =>
  renderPage(
    <QueryParamProvider adapter={ReactRouter6Adapter}>
      <Approvals />
    </QueryParamProvider>,
    { route, path: '/approvals/:type' },
  );

describe('Approvals (#499)', () => {
  let activityLogParams: URLSearchParams[] = [];

  beforeEach(() => {
    activityLogParams = [];
    server.use(
      http.get(api('/dashboard/pending-approvals'), () =>
        HttpResponse.json({ accessRequests: 2, activityLogs: 1, eventRegistrations: 4, total: 7 }),
      ),
      http.get(api('/access-request/new'), () => HttpResponse.json(page)),
      http.get(api('/access-request/approved'), () => HttpResponse.json(page)),
      http.get(api('/activity-log'), ({ request }) => {
        activityLogParams.push(new URL(request.url).searchParams);
        return HttpResponse.json(page);
      }),
      http.get(api('/activity-log/counters'), () =>
        HttpResponse.json({ pending: 1, approved: 10, rejected: 0 }),
      ),
      http.get(api('/event-registrations'), () => HttpResponse.json(page)),
    );
  });

  it('shows the pending counters on the tabs and the total', async () => {
    render('/approvals/volunteers');
    expect(await screen.findByText(t('approvals:pending_total', { count: 7 }))).toBeInTheDocument();
    expect(screen.getByLabelText(`${t('approvals:tabs.volunteers')} (2)`)).toBeInTheDocument();
    expect(screen.getByLabelText(`${t('approvals:tabs.hours')} (1)`)).toBeInTheDocument();
    expect(screen.getByLabelText(`${t('approvals:tabs.events')} (4)`)).toBeInTheDocument();
    // volunteer applications: Pending / Approved / Rejected
    expect(screen.getByLabelText(t('approvals:status.approved'))).toBeInTheDocument();
  });

  it('lists approved hours on their own tab', async () => {
    render('/approvals/hours');
    await waitFor(() => expect(activityLogParams.length).toBeGreaterThan(0));
    expect(activityLogParams[0].get('resolutionStatus')).toBe('new');

    await userEvent.click(screen.getByLabelText(t('approvals:status.approved')));
    await waitFor(() =>
      expect(
        activityLogParams.some(
          (params) =>
            params.get('resolutionStatus') === 'solved' && params.get('status') === 'approved',
        ),
      ).toBe(true),
    );
  });

  it('opens the volunteer applications for an unknown type', async () => {
    render('/approvals/whatever');
    expect(await screen.findByLabelText(t('approvals:status.pending'))).toBeInTheDocument();
  });
});
