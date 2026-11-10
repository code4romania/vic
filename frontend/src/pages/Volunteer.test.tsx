import React from 'react';
import { waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter6Adapter } from 'use-query-params/adapters/react-router-6';
import Volunteer, { VolunteerTabsOptions } from './Volunteer';
import { renderPage } from '../test/render';
import { api, server } from '../test/server';

describe('Volunteer profile, Documents tab (major 9)', () => {
  it('never asks for the organization-wide contracts while the volunteer is unknown', async () => {
    const contractRequests: URLSearchParams[] = [];
    let volunteerRequests = 0;
    server.use(
      http.get(api('/volunteer/:id'), () => {
        volunteerRequests++;
        return HttpResponse.json({ message: 'down' }, { status: 500 });
      }),
      http.get(api('/contract*'), ({ request }) => {
        contractRequests.push(new URL(request.url).searchParams);
        return HttpResponse.json({ items: [], meta: {} });
      }),
    );

    renderPage(
      <QueryParamProvider adapter={ReactRouter6Adapter}>
        <Volunteer query={{ activeTab: VolunteerTabsOptions.DOCUMENTS }} setQuery={vi.fn()} />
      </QueryParamProvider>,
      { route: '/volunteers/v1?activeTab=documents', path: '/volunteers/:id' },
    );

    await waitFor(() => expect(volunteerRequests).toBeGreaterThan(0));
    // the tab mounts with the page: give its queries a moment to start
    await new Promise((resolve) => setTimeout(resolve, 100));
    expect(contractRequests.filter((params) => !params.get('volunteerId'))).toHaveLength(0);
  });
});
