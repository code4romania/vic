import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import EventRegistrations from './EventRegistrations';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';

const registration = (overrides: object = {}) => ({
  id: 'r1',
  status: 'pending',
  rejectionReason: null,
  decidedOn: null,
  decidedByName: null,
  createdOn: '2026-11-08T10:00:00Z',
  event: { id: 'e1', name: 'Maraton', startDate: '2026-11-20T09:00:00Z' },
  user: { id: 'u1', name: 'Ion Popa', email: 'ion@example.ro' },
  volunteerId: null,
  volunteerStatus: null,
  ...overrides,
});

const page = (items: object[]) => ({
  items,
  meta: {
    itemCount: items.length,
    totalItems: items.length,
    itemsPerPage: 10,
    totalPages: 1,
    currentPage: 1,
  },
});

const render = (route = '/events/registrations') =>
  renderPage(
    <QueryParamProvider adapter={ReactRouter6Adapter}>
      <EventRegistrations />
    </QueryParamProvider>,
    { route },
  );

const openActions = async () => {
  const row = (await screen.findByText('Ion Popa')).closest('[role="row"]') as HTMLElement;
  await userEvent.click(within(row).getByRole('button'));
};

describe('EventRegistrations (#501)', () => {
  it('lists pending registrations and approves one', async () => {
    const statuses: (string | null)[] = [];
    const approved: string[] = [];
    server.use(
      http.get(api('/event-registrations'), ({ request }) => {
        statuses.push(new URL(request.url).searchParams.get('status'));
        return HttpResponse.json(page([registration()]));
      }),
      http.patch(api('/event-registrations/:id/approve'), ({ params }) => {
        approved.push(params.id as string);
        return HttpResponse.json({});
      }),
    );
    render();

    expect(await screen.findByText('Maraton')).toBeInTheDocument();
    expect(screen.getByText(t('events:registrations.volunteer_status.none'))).toBeInTheDocument();
    expect(statuses[0]).toBe('pending');

    await openActions();
    await userEvent.click(screen.getByText(t('events:registrations.approve')));
    await waitFor(() => expect(approved).toEqual(['r1']));
  });

  it('rejects only with a reason', async () => {
    const reasons: unknown[] = [];
    server.use(
      http.get(api('/event-registrations'), () => HttpResponse.json(page([registration()]))),
      http.patch(api('/event-registrations/:id/reject'), async ({ request }) => {
        reasons.push(await request.json());
        return HttpResponse.json({});
      }),
    );
    render();

    await openActions();
    await userEvent.click(screen.getByText(t('events:registrations.reject.button')));
    const confirm = screen.getByRole('button', { name: t('events:registrations.reject.confirm') });
    await userEvent.click(confirm);
    expect(await screen.findByText(t('events:registrations.reject.required'))).toBeInTheDocument();
    expect(reasons).toEqual([]);

    await userEvent.type(
      screen.getByLabelText(t('events:registrations.reject.reason')),
      'Doar pentru Logistică',
    );
    await userEvent.click(confirm);
    await waitFor(() => expect(reasons).toEqual([{ reason: 'Doar pentru Logistică' }]));
  });

  it('shows the decision on the rejected tab and lets the NGO change it', async () => {
    server.use(
      http.get(api('/event-registrations'), () =>
        HttpResponse.json(
          page([
            registration({
              status: 'rejected',
              rejectionReason: 'Nu mai sunt locuri',
              decidedByName: 'Ana Admin',
              decidedOn: '2026-11-09T10:00:00Z',
              volunteerId: 'v1',
              volunteerStatus: 'active',
            }),
          ]),
        ),
      ),
    );
    render('/events/registrations?status=rejected');

    expect(await screen.findByText('Nu mai sunt locuri')).toBeInTheDocument();
    expect(screen.getByText(/Ana Admin/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ion Popa' })).toHaveAttribute(
      'href',
      '/volunteers/v1',
    );

    await openActions();
    expect(screen.getByText(t('events:registrations.approve'))).toBeInTheDocument();
    expect(screen.queryByText(t('events:registrations.reject.button'))).not.toBeInTheDocument();
  });
});
