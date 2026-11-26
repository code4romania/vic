import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import NgoHubNotUs from './NgoHubNotUs';
import { renderPage, t } from '../test/render';
import { api, businessError, server } from '../test/server';

const TOKEN = 'r'.repeat(43);

const capture = (answer: () => Response) => {
  const bodies: unknown[] = [];
  server.use(
    http.post(api('/auth/web/ngohub/not-us'), async ({ request }) => {
      bodies.push(await request.json());
      return answer();
    }),
  );
  return bodies;
};

const render = (route = `/login/ngohub/not-us?token=${TOKEN}`) =>
  renderPage(<NgoHubNotUs />, { route, path: '/login/ngohub/not-us' });

describe('"It was not us"', () => {
  it('uses the link only when the button is pressed', async () => {
    const bodies = capture(() => new HttpResponse(null, { status: 204 }));
    render();
    expect(bodies).toEqual([]);

    await userEvent.click(screen.getByRole('button', { name: t('ngohub:not_us.confirm') }));
    expect(await screen.findByText(t('ngohub:not_us.done'))).toBeInTheDocument();
    expect(bodies).toEqual([{ token: TOKEN }]);
  });

  it('says when the link was used already', async () => {
    capture(() => businessError(400, 'AUTH_005'));
    render();
    await userEvent.click(screen.getByRole('button', { name: t('ngohub:not_us.confirm') }));
    expect(await screen.findByText(t('ngohub:not_us.expired'))).toBeInTheDocument();
  });
});
