import { http, HttpResponse } from 'msw';
import { getDivisionsListItems } from './division.api';
import { DivisionType } from '../../common/enums/division-type.enum';
import { api, server } from '../../test/server';

describe('departments / roles dropdowns (audit minor: limit 50)', () => {
  it('fetches every page of the listing, not only the first 50', async () => {
    const pages: (string | null)[] = [];
    server.use(
      http.get(api('/listing/structures/:type'), ({ request }) => {
        const page = new URL(request.url).searchParams.get('page');
        pages.push(page);
        const offset = (Number(page) - 1) * 50;
        const count = page === '3' ? 7 : 50;
        return HttpResponse.json({
          items: Array.from({ length: count }, (_, index) => ({
            id: `d${offset + index}`,
            name: `Departament ${offset + index}`,
            numberOfMembers: 0,
          })),
          meta: { totalItems: 107, totalPages: 3, currentPage: Number(page), itemsPerPage: 50 },
        });
      }),
    );

    const result = await getDivisionsListItems(DivisionType.DEPARTMENT);

    expect(result.items).toHaveLength(107);
    expect(pages.sort()).toEqual(['1', '2', '3']);
  });
});
