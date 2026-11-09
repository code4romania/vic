import React from 'react';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import Announcements from './Announcements';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';

describe('Announcements counters (#502)', () => {
  it('shows active, inactive, archived and total responses from the API', async () => {
    server.use(
      http.get(api('/announcement'), () =>
        HttpResponse.json({
          items: [],
          meta: { itemCount: 0, totalItems: 0, itemsPerPage: 10, totalPages: 0, currentPage: 1 },
        }),
      ),
      http.get(api('/announcement/counters'), () =>
        HttpResponse.json({ active: 3, inactive: 1, archived: 5, responses: 42 }),
      ),
    );
    renderPage(<Announcements query={{ limit: 10, page: 1 }} setQuery={vi.fn()} />);

    expect(await screen.findByText('42')).toBeInTheDocument();
    expect(screen.getByText(t('announcement:counters.responses'))).toBeInTheDocument();
    expect(screen.getByText(t('announcement:counters.active')).nextSibling).toHaveTextContent('3');
    expect(screen.getByText(t('announcement:counters.archived')).nextSibling).toHaveTextContent(
      '5',
    );
    expect(screen.getByText(t('announcement:counters.inactive')).nextSibling).toHaveTextContent(
      '1',
    );
  });
});
