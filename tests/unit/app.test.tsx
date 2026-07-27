import { render, screen } from '@testing-library/react';

import Home from '@/app/page';

describe('Home', () => {
  it('renders Langflow RAG', () => {
    render(<Home />);

    expect(screen.getByRole('heading', { name: 'Langflow RAG' })).toBeVisible();
  });
});
