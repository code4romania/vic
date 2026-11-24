import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import AccessRequest from './AccessRequest';
import { renderPage, t } from '../test/render';
import { api, businessError, server } from '../test/server';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';

vi.mock('../hooks/useToast', () => ({ useSuccessToast: vi.fn(), useErrorToast: vi.fn() }));

const request = (status: string) => ({
  id: 'ar-1',
  status,
  createdOn: '2026-11-01T10:00:00.000Z',
  updatedOn: '2026-11-02T10:00:00.000Z',
  rejectionReason: status === 'rejected' ? 'Nu mai avem locuri' : null,
  answers: [],
  requestedBy: {
    id: 'u-1',
    name: 'Elena Pop',
    email: 'elena@example.ro',
    phone: '+40722000000',
    age: 31,
    sex: 'female',
    location: null,
    profilePicture: '',
  },
});

const show = (status: string) => {
  server.use(http.get(api('/access-request/ar-1'), () => HttpResponse.json(request(status))));
  renderPage(<AccessRequest />, {
    route: '/volunteers/requests/ar-1',
    path: '/volunteers/requests/:id',
  });
};

describe('AccessRequest (#500)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('needs a reason to reject, and sends it', async () => {
    let body: Record<string, unknown> | undefined;
    server.use(
      http.post(api('/access-request/ar-1/reject'), async ({ request: req }) => {
        body = (await req.json()) as Record<string, unknown>;
        return HttpResponse.json(request('rejected'), { status: 201 });
      }),
    );
    show('pending');

    await userEvent.click(await screen.findByRole('button', { name: t('general:reject') }));
    // no "send without a message" any more
    expect(screen.queryByRole('button', { name: t('reject_modal:send') })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: t('general:send') }));
    expect(await screen.findByText(t('reject_modal:form.required'))).toBeInTheDocument();
    expect(body).toBeUndefined();

    await userEvent.type(screen.getByRole('textbox'), 'Nu mai avem locuri');
    await userEvent.click(screen.getByRole('button', { name: t('general:send') }));
    await waitFor(() => expect(body).toEqual({ rejectionReason: 'Nu mai avem locuri' }));
  });

  it('changes an approval into a rejection, and explains when the volunteer already has activity', async () => {
    server.use(
      http.post(api('/access-request/ar-1/reject'), () => businessError(400, 'ACCESS_REQUEST_005')),
    );
    show('approved');

    await userEvent.click(
      await screen.findByRole('button', { name: t('access_requests:popover.change_to_rejected') }),
    );
    await userEvent.type(screen.getByRole('textbox'), 'Aprobat din greșeală');
    await userEvent.click(screen.getByRole('button', { name: t('general:send') }));

    await waitFor(() =>
      expect(useErrorToast).toHaveBeenCalledWith(t('access_requests:errors.ACCESS_REQUEST_005')),
    );
  });

  it('changes a rejection into an approval', async () => {
    let approved = false;
    server.use(
      http.post(api('/access-request/ar-1/approve'), () => {
        approved = true;
        return HttpResponse.json(request('approved'), { status: 201 });
      }),
    );
    show('rejected');
    expect(await screen.findByText(/Nu mai avem locuri/)).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: t('access_requests:popover.change_to_approved') }),
    );
    await waitFor(() => expect(approved).toBe(true));
    expect(useSuccessToast).toHaveBeenCalled();
  });
});
