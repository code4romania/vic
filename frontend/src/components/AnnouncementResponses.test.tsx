import React from 'react';
import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import AnnouncementResponses from './AnnouncementResponses';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';

describe('AnnouncementResponses (#504)', () => {
  it('lists the answers with volunteer, comment and date', async () => {
    server.use(
      http.get(api('/announcement/a1/responses'), () =>
        HttpResponse.json({
          items: [
            {
              id: 'r1',
              comment: 'Vin sâmbătă',
              createdOn: '2026-11-09T10:00:00Z',
              user: { id: 'u1', name: 'Bogdan Ion', email: 'bogdan@ong.ro' },
              volunteerId: 'v1',
            },
          ],
          meta: { itemCount: 1, totalItems: 1, itemsPerPage: 10, totalPages: 1, currentPage: 1 },
        }),
      ),
    );
    renderPage(<AnnouncementResponses announcementId="a1" />);

    expect(await screen.findByText('Vin sâmbătă')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Bogdan Ion' })).toHaveAttribute(
      'href',
      '/volunteers/v1',
    );
    expect(screen.getByText('bogdan@ong.ro')).toBeInTheDocument();
    expect(screen.getByText(t('announcement:responses.title', { count: 1 }))).toBeInTheDocument();
  });
});
