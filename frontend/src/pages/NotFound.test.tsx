import React from 'react';
import { screen } from '@testing-library/react';
import NotFound from './NotFound';
import { renderPage, t } from '../test/render';

describe('NotFound', () => {
  it('explains and links home', () => {
    renderPage(<NotFound />, { route: '/nu-exista' });
    expect(screen.getByRole('heading', { name: t('not_found:title') })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: t('not_found:home') })).toHaveAttribute('href', '/');
    expect(screen.getByRole('button', { name: t('not_found:back') })).toBeInTheDocument();
  });
});
