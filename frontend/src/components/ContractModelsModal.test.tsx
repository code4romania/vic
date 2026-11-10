import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import ContractModelsModal from './ContractModelsModal';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';
import API from '../services/api';

vi.mock('../hooks/useToast', () => ({ useErrorToast: vi.fn(), useSuccessToast: vi.fn() }));

describe('ContractModelsModal (Template-uri)', () => {
  it('lists the blank models, uploads a PDF with a name and deletes one', async () => {
    let models = [
      { id: 'm1', name: 'Model 2026', createdOn: '2026-11-01T00:00:00.000Z', uri: 'https://x/m1' },
    ];
    let uploaded: FormData | undefined;
    const deleted: string[] = [];
    server.use(
      http.get(api('/template'), () => HttpResponse.json(models)),
      http.post(api('/template'), () => HttpResponse.json(models[0], { status: 201 })),
      http.delete(api('/template/:id'), ({ params }) => {
        deleted.push(params.id as string);
        models = [];
        return HttpResponse.json(params.id);
      }),
    );
    const interceptor = API.interceptors.request.use((config) => {
      if (config.url === 'template' && config.method === 'post') uploaded = config.data as FormData;
      return config;
    });
    renderPage(<ContractModelsModal onClose={vi.fn()} />);

    expect(await screen.findByText('Model 2026')).toBeInTheDocument();

    await userEvent.click(screen.getByText(t('documents:models.upload')));
    expect(await screen.findByText(t('documents:models.name_required'))).toBeInTheDocument();
    expect(screen.getByText(t('documents:models.file_required'))).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText(t('documents:models.name')), 'Acord voluntariat');
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    await userEvent.upload(input, new File(['%PDF-1.4'], 'acord.pdf', { type: 'application/pdf' }));
    await userEvent.click(screen.getByText(t('documents:models.upload')));
    await waitFor(() => expect(uploaded?.get('name')).toBe('Acord voluntariat'));
    expect((uploaded?.get('template') as File).name).toBe('acord.pdf');

    await userEvent.click(
      screen.getByRole('button', { name: `${t('documents:models.delete')} Model 2026` }),
    );
    await waitFor(() => expect(deleted).toEqual(['m1']));
    expect(await screen.findByText(t('documents:models.empty'))).toBeInTheDocument();
    API.interceptors.request.eject(interceptor);
  });
});
