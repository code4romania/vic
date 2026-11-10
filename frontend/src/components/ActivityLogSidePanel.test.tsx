import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import ActivityLogSidePanel from './ActivityLogSidePanel';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';

vi.mock('../hooks/useToast', () => ({ useSuccessToast: vi.fn(), useErrorToast: vi.fn() }));

const pendingLog = {
  id: 'log-1',
  date: '2026-11-03T00:00:00.000Z',
  hours: 4,
  status: 'pending',
  mentions: 'Punct de hidratare',
  volunteer: { id: 'v-1', name: 'Elena Pop' },
  createdOn: '2026-11-04T10:00:00.000Z',
};

// #593: hours are never rejected without a reason; the volunteer sees it in the app and by email.
describe('ActivityLogSidePanel rejection (#593)', () => {
  it('needs a reason to reject the hours, and sends it', async () => {
    let body: Record<string, unknown> | undefined;
    server.use(
      http.get(api('/activity-log/log-1'), () => HttpResponse.json(pendingLog)),
      http.patch(api('/activity-log/log-1/reject'), async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ ...pendingLog, status: 'rejected' });
      }),
    );
    renderPage(<ActivityLogSidePanel isOpen onClose={vi.fn()} activityLogId="log-1" />);

    await userEvent.click(await screen.findByRole('button', { name: t('general:reject') }));
    const dialog = await screen.findByRole('dialog', { name: t('activity_log:modal.title') });

    // no "reject without a message" any more: the other button only closes the modal
    expect(
      within(dialog).queryByRole('button', { name: t('reject_modal:send') }),
    ).not.toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: t('general:cancel') })).toBeInTheDocument();

    await userEvent.click(within(dialog).getByRole('button', { name: t('general:reject') }));
    expect(await within(dialog).findByText(t('reject_modal:form.required'))).toBeInTheDocument();
    expect(body).toBeUndefined();

    await userEvent.type(within(dialog).getByRole('textbox'), 'Nu ai fost la eveniment');
    await userEvent.click(within(dialog).getByRole('button', { name: t('general:reject') }));
    await waitFor(() => expect(body).toEqual({ rejectionReason: 'Nu ai fost la eveniment' }));
  });
});
