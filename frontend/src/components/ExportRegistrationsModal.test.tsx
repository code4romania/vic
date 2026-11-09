import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import ExportRegistrationsModal from './ExportRegistrationsModal';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';

describe('ExportRegistrationsModal (#497)', () => {
  it('downloads only the chosen columns, in the file order', async () => {
    const asked: (string | null)[] = [];
    server.use(
      http.get(api('/event/e1/registrations/download'), ({ request }) => {
        asked.push(new URL(request.url).searchParams.get('fields'));
        return new HttpResponse(new ArrayBuffer(8));
      }),
    );
    URL.createObjectURL = vi.fn(() => 'blob:x');
    const onClose = vi.fn();
    renderPage(<ExportRegistrationsModal eventId="e1" eventName="Maraton" onClose={onClose} />);

    // every column starts selected; keep only hours and name
    for (const field of ['email', 'phone', 'department', 'branch', 'role', 'registeredOn']) {
      await userEvent.click(
        screen.getByLabelText(t(`events:export_registrations.fields.${field}`)),
      );
    }
    await userEvent.click(
      screen.getByRole('button', { name: t('events:export_registrations.submit') }),
    );

    await waitFor(() => expect(asked).toEqual(['name,hours']));
    await waitFor(() => expect(onClose).toHaveBeenCalled());
  });

  it('cannot download with no column', async () => {
    renderPage(<ExportRegistrationsModal eventId="e1" onClose={vi.fn()} />);
    for (const checkbox of screen.getAllByRole('checkbox')) {
      await userEvent.click(checkbox);
    }
    expect(
      screen.getByRole('button', { name: t('events:export_registrations.submit') }),
    ).toBeDisabled();
  });
});
