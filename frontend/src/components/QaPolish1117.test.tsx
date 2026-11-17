import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import ContractsTable, { fileTypeLabel } from './ContractsTable';
import DivisionChips from './DivisionChips';
import Volunteers from '../pages/Volunteers';
import { renderPage, t } from '../test/render';
import { api, server } from '../test/server';
import { DivisionType } from '../common/enums/division-type.enum';

vi.mock('../hooks/useToast', () => ({ useErrorToast: vi.fn(), useSuccessToast: vi.fn() }));

// Small fixes from the staging QA on 17 Nov 2026 (#679, #680, #682, #688, #689).

const page = (items: unknown[]) => ({
  items,
  meta: {
    itemCount: items.length,
    totalItems: items.length,
    itemsPerPage: 10,
    totalPages: 1,
    currentPage: 1,
  },
});

describe('event capacity counts (#679)', () => {
  it.each([
    [1, '1 înscris, fără limită'],
    [2, '2 înscriși, fără limită'],
    [20, '20 de înscriși, fără limită'],
  ])('%i → %s', (going, text) => {
    expect(t('events:detail.capacity_unlimited', { going, count: going })).toBe(text);
  });
});

describe('event form copy (#680)', () => {
  it('says "evenimentul", and explains why a published event keeps its audience', () => {
    expect(t('events:form.target.disclaimer')).toContain('evenimentul');
    expect(t('events:form.target.locked')).not.toContain('events:');
  });
});

describe('old volunteer status in the action archive (#682)', () => {
  it('translates "archived"', () => {
    expect(t('volunteer:status.archived')).toBe('arhivat');
  });
});

describe('contract download button names the file type (#688)', () => {
  it.each([
    ['Contract_1.pdf', 'PDF'],
    ['Contract_1.docx', 'DOCX'],
    ['fara-extensie', 'PDF'],
    [undefined, 'PDF'],
  ])('%p → %p', (fileName, label) => {
    expect(fileTypeLabel(fileName, 'PDF')).toBe(label);
  });

  it('shows DOCX for a Word contract', async () => {
    server.use(
      http.get(api('/contract'), () =>
        HttpResponse.json(
          page([
            {
              id: 'c1',
              contractNumber: '1',
              volunteer: { id: 'v1', name: 'Elena Pop' },
              status: 'SIGNED',
              expiringSoon: false,
              startDate: '2026-01-01T00:00:00.000Z',
              endDate: null,
              fileName: 'Contract_1.docx',
              uri: 'https://files/c1.docx',
            },
          ]),
        ),
      ),
    );
    renderPage(<ContractsTable query={{ limit: 10, page: 1 }} setQuery={vi.fn()} />);

    expect(await screen.findByRole('button', { name: /DOCX Contract_1.docx/ })).toBeInTheDocument();
  });
});

describe('small UI fixes (#689)', () => {
  it.each([
    [DivisionType.BRANCH, 'Cluj', 'Șterge filiala', 'această filială'],
    [DivisionType.DEPARTMENT, 'Logistică', 'Șterge departamentul', 'acest departament'],
  ])('asks to delete a %s with the right grammar', async (type, name, title, phrase) => {
    server.use(
      http.get(api(`/organization-structure/${type}`), () =>
        HttpResponse.json(page([{ id: 'd1', name, numberOfMembers: 0 }])),
      ),
    );
    renderPage(<DivisionChips type={type} />);

    await userEvent.click(await screen.findByRole('button', { name: `Șterge ${name}` }));

    expect(await screen.findByText(title)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(phrase))).toBeInTheDocument();
  });

  it('the volunteer name opens the profile', async () => {
    server.use(
      http.get(api('/volunteer'), () =>
        HttpResponse.json(
          page([
            {
              id: 'vol-1',
              status: 'active',
              createdOn: '2026-01-01T00:00:00.000Z',
              user: { id: 'u1', name: 'Ana Activ' },
              profile: null,
              approvedHours: 0,
            },
          ]),
        ),
      ),
      http.get(api('/listing/*'), () => HttpResponse.json([])),
    );
    renderPage(<Volunteers query={{ limit: 10, page: 1 }} setQuery={vi.fn()} />);

    expect((await screen.findByText('Ana Activ')).closest('a')).toHaveAttribute('href', '/vol-1');
  });
});
