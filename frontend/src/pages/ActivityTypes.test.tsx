import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import ActivityTypes from './ActivityTypes';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';

const type = (id: string, name: string, status: string) => ({
  id,
  name,
  status,
  icon: 'icon',
  description: '',
  branch: null,
  department: null,
  role: null,
});

const ALL = [
  type('t1', 'Logistică', 'active'),
  type('t2', 'Comunicare', 'active'),
  type('t3', 'Strângere fonduri', 'archived'),
];

describe('ActivityTypes', () => {
  it('keeps the Active / Archived counters for the whole organization while searching', async () => {
    server.use(
      http.get(api('/activity-type'), ({ request }) => {
        const search = new URL(request.url).searchParams.get('search');
        return HttpResponse.json(
          search ? ALL.filter((item) => item.name.toLowerCase().includes(search)) : ALL,
        );
      }),
    );
    renderPage(<ActivityTypes query={{ search: 'logi' }} setQuery={vi.fn()} />);

    const counter = (status: string) =>
      screen.getByText(t(`activity_types:page.counters.${status}.label`)).nextSibling;
    await waitFor(() => expect(counter('active')).toHaveTextContent('2'));
    expect(counter('archived')).toHaveTextContent('1');
    expect(await screen.findByText(t('activity_types:page.found', { count: 1 }))).toBeVisible();
  });

  it('shows the load error with a retry, not an empty list', async () => {
    server.use(
      http.get(api('/activity-type'), () =>
        HttpResponse.json({ message: 'down' }, { status: 500 }),
      ),
    );
    renderPage(<ActivityTypes query={{}} setQuery={vi.fn()} />);

    expect(await screen.findByText(t('general:error.load_entries'))).toBeInTheDocument();
    expect(screen.getByRole('button', { name: t('states:retry') })).toBeInTheDocument();
  });
});
