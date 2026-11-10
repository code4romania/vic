import React from 'react';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import Team from './Team';
import { renderPage, t } from '../test/render';
import { ADMIN, api, server } from '../test/server';
import { ITeamMember } from '../common/interfaces/team.interface';
import { useSuccessToast } from '../hooks/useToast';

vi.mock('../hooks/useToast', () => ({ useSuccessToast: vi.fn(), useErrorToast: vi.fn() }));

const member = (overrides: Partial<ITeamMember>): ITeamMember => ({
  id: 'x',
  name: 'X',
  email: 'x@ong.test',
  phone: '+40700000000',
  status: 'active',
  inviteExpiresAt: null,
  lastInviteSentAt: null,
  lastInviteSentBy: null,
  lastLoginAt: null,
  ...overrides,
});

const inFiveDays = new Date(Date.now() + 5 * 86_400_000 - 60_000).toISOString();
const TEAM = [
  member({ id: ADMIN.id, name: ADMIN.name, email: ADMIN.email, status: 'active' }),
  member({
    id: 'u-sent',
    name: 'Bogdan Sent',
    status: 'invite_sent',
    inviteExpiresAt: inFiveDays,
    lastInviteSentAt: inFiveDays,
    lastInviteSentBy: ADMIN.name,
  }),
  member({ id: 'u-expired', name: 'Carmen Expired', status: 'invite_expired' }),
  member({ id: 'u-disabled', name: 'Dan Disabled', status: 'disabled' }),
  member({ id: 'u-active', name: 'Elena Active', status: 'active' }),
];

const row = (name: string) => screen.getAllByText(name)[0].closest('[role="row"]') as HTMLElement;

const menuOf = async (name: string): Promise<string[]> => {
  const button = within(row(name)).queryByRole('button');
  if (!button) return [];
  await userEvent.click(button);
  // the row menu's options are buttons (keyboard access, audit major 7)
  const texts = within(row(name))
    .getAllByRole('button')
    .filter((option) => option !== button)
    .map((option) => option.textContent ?? '');
  await userEvent.click(button);
  return texts;
};

beforeEach(() => {
  server.use(http.get(api('/organization/team'), () => HttpResponse.json(TEAM)));
  vi.mocked(useSuccessToast).mockClear();
});

describe('Team', () => {
  it('counts active admins, pending invites and disabled admins', async () => {
    renderPage(<Team />);
    await screen.findByText('Bogdan Sent');
    const counter = (key: string) =>
      screen.getByText(t(`team:counters.${key}.label`)).parentElement as HTMLElement;
    expect(within(counter('active')).getByText('2')).toBeInTheDocument();
    expect(within(counter('pending')).getByText('2')).toBeInTheDocument();
    expect(within(counter('disabled')).getByText('1')).toBeInTheDocument();
  });

  it('shows each status, with the days left on a sent invite', async () => {
    renderPage(<Team />);
    expect(await screen.findByText('Bogdan Sent')).toBeInTheDocument();
    expect(screen.getByText(t('team:status.invite_sent', { days: 5 }))).toBeInTheDocument();
    expect(screen.getByText(t('team:status.invite_expired'))).toBeInTheDocument();
    expect(screen.getByText(t('team:status.disabled'))).toBeInTheDocument();
    expect(screen.getAllByText(t('team:status.active'))).toHaveLength(2);
  });

  it('Send invite only for pending admins; Enable only for disabled ones; nothing on yourself', async () => {
    renderPage(<Team />);
    await screen.findByText('Bogdan Sent');

    expect(await menuOf(ADMIN.name)).toEqual([]);
    expect(await menuOf('Bogdan Sent')).toEqual([
      t('team:actions.send_invite'),
      t('team:actions.disable'),
    ]);
    expect(await menuOf('Carmen Expired')).toEqual([
      t('team:actions.send_invite'),
      t('team:actions.disable'),
    ]);
    expect(await menuOf('Dan Disabled')).toEqual([t('team:actions.enable')]);
    expect(await menuOf('Elena Active')).toEqual([t('team:actions.disable')]);
  });

  it('Send invite asks first, then toasts the masked email', async () => {
    let invited = '';
    server.use(
      http.post(api('/organization/team/:userId/invite'), ({ params }) => {
        invited = String(params.userId);
        return HttpResponse.json({ maskedEmail: 'c•••@ong.test' });
      }),
    );
    renderPage(<Team />);
    await screen.findByText('Carmen Expired');
    await userEvent.click(within(row('Carmen Expired')).getByRole('button'));
    await userEvent.click(screen.getByText(t('team:actions.send_invite')));

    const dialog = await screen.findByRole('dialog');
    expect(invited).toBe('');
    await userEvent.click(
      within(dialog).getByRole('button', { name: t('team:confirm.invite.button') }),
    );

    await waitFor(() =>
      expect(useSuccessToast).toHaveBeenCalledWith(
        t('team:toast.invite_sent', { email: 'c•••@ong.test' }),
      ),
    );
    expect(invited).toBe('u-expired');
  });

  it('Enable calls the enable route, which sends no invite (R20)', async () => {
    const calls: string[] = [];
    server.use(
      http.patch(api('/organization/team/:userId/:action'), ({ params }) => {
        calls.push(`${params.action} ${params.userId}`);
        return new HttpResponse(null, { status: 204 });
      }),
      http.post(api('/organization/team/:userId/invite'), ({ params }) => {
        calls.push(`invite ${params.userId}`);
        return HttpResponse.json({ maskedEmail: 'x' });
      }),
    );
    renderPage(<Team />);
    await screen.findByText('Dan Disabled');
    await userEvent.click(within(row('Dan Disabled')).getByRole('button'));
    await userEvent.click(screen.getByText(t('team:actions.enable')));
    await userEvent.click(
      within(await screen.findByRole('dialog')).getByRole('button', {
        name: t('team:confirm.enable.button'),
      }),
    );

    await waitFor(() =>
      expect(useSuccessToast).toHaveBeenCalledWith(
        t('team:toast.enabled', { name: 'Dan Disabled' }),
      ),
    );
    expect(calls).toEqual(['enable u-disabled']);
  });

  // #508
  it('adding an admin asks for the code emailed to me', async () => {
    let added: unknown;
    server.use(
      http.post(api('/security/code'), async ({ request }) => {
        expect(await request.json()).toEqual({ action: 'ADD_ADMIN' });
        return HttpResponse.json({ maskedEmail: 'a•••@ong.test' });
      }),
      http.post(api('/organization/team'), async ({ request }) => {
        added = await request.json();
        return HttpResponse.json({ maskedEmail: 'm•••@ong.test' }, { status: 201 });
      }),
    );
    renderPage(<Team />);
    await screen.findByText('Bogdan Sent');
    await userEvent.click(screen.getByText(t('team:add_admin')));
    const dialog = await screen.findByRole('dialog');
    for (const [field, value] of [
      ['firstName', 'Maria'],
      ['lastName', 'Ionescu'],
      ['email', 'maria@ong.test'],
      ['phone', '+40722222222'],
    ]) {
      await userEvent.type(within(dialog).getByLabelText(t(`team:form.${field}`)), value);
    }
    await userEvent.click(within(dialog).getByText(t('team:form.submit')));
    expect(await within(dialog).findByText(t('team:form.code_required'))).toBeInTheDocument();
    expect(added).toBeUndefined();

    await userEvent.click(within(dialog).getByText(t('settings:security.code.send')));
    await userEvent.type(
      await within(dialog).findByLabelText(t('settings:security.code.label')),
      '123456',
    );
    await userEvent.click(within(dialog).getByText(t('team:form.submit')));
    await waitFor(() => expect(added).toMatchObject({ email: 'maria@ong.test', code: '123456' }));
  });
});
