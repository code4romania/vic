import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { Route } from 'react-router-dom';
import AddVolunteer from './AddVolunteer';
import { renderPage, t } from '../test/render';
import { api, businessError, server } from '../test/server';
import { useErrorToast, useSuccessToast } from '../hooks/useToast';

vi.mock('../hooks/useToast', () => ({ useSuccessToast: vi.fn(), useErrorToast: vi.fn() }));

const f = (key: string) => t(`volunteers:add.${key}`);
const type = (label: string, value: string) => userEvent.type(screen.getByLabelText(label), value);
const submit = () => userEvent.click(screen.getByRole('button', { name: f('submit') }));

const render = () =>
  renderPage(<AddVolunteer />, {
    route: '/volunteers/add',
    path: '/volunteers/add',
    routes: <Route path="/volunteers/:id" element={<p>volunteer page</p>} />,
  });

describe('AddVolunteer (#471)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('requires first name, last name and email, in Romanian', async () => {
    render();
    await submit();
    expect(await screen.findAllByText('Câmpul este obligatoriu')).toHaveLength(3);
  });

  it('sends a Candidate with only the fields filled in, then opens the volunteer', async () => {
    let body: Record<string, unknown> | undefined;
    server.use(
      http.post(api('/volunteer'), async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: 'v-new', status: 'candidate' }, { status: 201 });
      }),
    );
    render();
    await type(f('firstName'), 'Maria');
    await type(f('lastName'), 'Ionescu');
    await type(f('email'), 'maria@ong.test');
    await type(f('notes'), 'Venită de la târg');
    await submit();

    expect(await screen.findByText('volunteer page')).toBeInTheDocument();
    expect(body).toEqual({
      firstName: 'Maria',
      lastName: 'Ionescu',
      email: 'maria@ong.test',
      notes: 'Venită de la târg',
      status: 'candidate',
    });
    expect(useSuccessToast).toHaveBeenCalledWith(
      t('volunteers:add.success_candidate', { name: 'Maria Ionescu' }),
    );
  });

  it('sends Active when chosen', async () => {
    let body: Record<string, unknown> | undefined;
    server.use(
      http.post(api('/volunteer'), async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: 'v-new', status: 'active' }, { status: 201 });
      }),
    );
    render();
    await type(f('firstName'), 'Maria');
    await type(f('lastName'), 'Ionescu');
    await type(f('email'), 'maria@ong.test');
    await userEvent.click(screen.getByLabelText(f('status_active')));
    await submit();

    await waitFor(() => expect(body?.status).toBe('active'));
    expect(useSuccessToast).toHaveBeenCalledWith(
      t('volunteers:add.success_active', { name: 'Maria Ionescu' }),
    );
  });

  it('shows the duplicate email error (VOLUNTEER_009)', async () => {
    server.use(http.post(api('/volunteer'), () => businessError(400, 'VOLUNTEER_009')));
    render();
    await type(f('firstName'), 'Maria');
    await type(f('lastName'), 'Ionescu');
    await type(f('email'), 'maria@ong.test');
    await submit();

    await waitFor(() =>
      expect(useErrorToast).toHaveBeenCalledWith(t('volunteers:errors.VOLUNTEER_009')),
    );
    expect(screen.queryByText('volunteer page')).toBeNull();
  });
});
