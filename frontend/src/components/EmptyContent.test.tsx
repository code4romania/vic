import React from 'react';
import { render, screen } from '@testing-library/react';
import EmptyContent from './EmptyContent';
import LoadingContent from './LoadingContent';
import { t } from '../test/render';

describe('EmptyContent', () => {
  it('shows the text, with an optional title and action', () => {
    render(
      <EmptyContent
        title="Niciun eveniment"
        description="Creează primul eveniment."
        action={<button>Adaugă</button>}
      />,
    );
    expect(screen.getByText('Niciun eveniment')).toBeInTheDocument();
    expect(screen.getByText('Creează primul eveniment.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Adaugă' })).toBeInTheDocument();
  });

  it('gives a load error a title', () => {
    render(<EmptyContent description={t('general:error.load_entries')} />);
    expect(screen.getByText(t('states:error_title'))).toBeInTheDocument();
  });

  it('a plain empty list has no title', () => {
    render(<EmptyContent description={t('general:empty_table')} />);
    expect(screen.queryByText(t('states:error_title'))).toBeNull();
  });
});

describe('LoadingContent', () => {
  it('says it is loading', () => {
    render(<LoadingContent />);
    expect(screen.getByText(t('states:loading'))).toBeInTheDocument();
  });
});
