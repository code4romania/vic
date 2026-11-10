import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Tabs from './Tabs';
import Popover from './Popover';
import MenuLink from './MenuLink';
import { t } from '../test/render';

// Audit major 7: everything reachable and usable from the keyboard, with names for screen readers.
describe('keyboard and screen reader access', () => {
  it('tabs are buttons in a tablist; Enter selects one', async () => {
    const onClick = vi.fn();
    render(
      <Tabs
        tabs={[
          { key: 'a', value: 'Unu' },
          { key: 'b', value: 'Doi', count: 3 },
        ]}
        onClick={onClick}
      >
        <p>content</p>
      </Tabs>,
    );
    const tabs = screen.getAllByRole('tab', { hidden: true });
    expect(tabs).toHaveLength(2);
    expect(tabs[0]).toHaveAttribute('aria-selected', 'true');

    tabs[1].focus();
    await userEvent.keyboard('{Enter}');
    expect(onClick).toHaveBeenCalledWith('b');
    expect(tabs[1]).toHaveAttribute('aria-selected', 'true');
  });

  it('the row menu "⋮" has a name and its options are buttons', async () => {
    const onEdit = vi.fn();
    render(
      <Popover row={{ id: 'r1' }} items={[{ label: 'Editează', icon: null, onClick: onEdit }]} />,
    );
    const trigger = screen.getByRole('button', { name: t('general:actions') });
    trigger.focus();
    await userEvent.keyboard('{Enter}');
    const option = await screen.findByRole('button', { name: 'Editează' });
    option.focus();
    await userEvent.keyboard('{Enter}');
    expect(onEdit).toHaveBeenCalledWith({ id: 'r1' });
  });

  it('a menu entry is a link with an href; a plain click stays in the app', async () => {
    const onClick = vi.fn();
    render(
      <MemoryRouter>
        <MenuLink
          item={{ id: 1, name: 'Evenimente', href: 'events' }}
          active={false}
          onClick={onClick}
        />
      </MemoryRouter>,
    );
    const link = screen.getByRole('link', { name: 'Evenimente' });
    expect(link).toHaveAttribute('href', '/events');
    await userEvent.click(link);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
