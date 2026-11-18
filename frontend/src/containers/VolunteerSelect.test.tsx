import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import VolunteerSelect from './VolunteerSelect';
import { renderPage } from '../test/render';
import { api, server } from '../test/server';

// #677: hours need a volunteer profile, so the hours form offers only volunteers who have one.
describe('VolunteerSelect', () => {
  const requests: URLSearchParams[] = [];

  beforeEach(() => {
    requests.length = 0;
    server.use(
      http.get(api('/listing/volunteers'), ({ request }) => {
        requests.push(new URL(request.url).searchParams);
        return HttpResponse.json({
          items: [{ id: 'v-1', name: 'Elena Pop' }],
          meta: { totalPages: 1 },
        });
      }),
    );
  });

  const open = async (): Promise<void> => {
    await userEvent.click(screen.getByRole('combobox'));
    await screen.findByText('Elena Pop');
  };

  it('asks only for volunteers with a profile when withProfile is set', async () => {
    renderPage(<VolunteerSelect label="Voluntar" onSelect={vi.fn()} withProfile />);
    await open();

    await waitFor(() => expect(requests.at(-1)?.get('withProfile')).toBe('true'));
    expect(requests.at(-1)?.get('status')).toBe('active');
  });

  it('asks for every active volunteer otherwise', async () => {
    renderPage(<VolunteerSelect label="Voluntar" onSelect={vi.fn()} />);
    await open();

    await waitFor(() => expect(requests.length).toBeGreaterThan(0));
    expect(requests.at(-1)?.has('withProfile')).toBe(false);
  });
});
