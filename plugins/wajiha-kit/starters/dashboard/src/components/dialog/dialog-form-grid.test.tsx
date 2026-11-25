import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '@/test/render';
import { DialogFormFullWidth, DialogFormGrid } from './dialog-form-grid';

describe('DialogFormGrid', () => {
  it('renders grid children and full-width children', () => {
    renderWithProviders(
      <DialogFormGrid>
        <span>First field</span>
        <DialogFormFullWidth>
          <span>Wide field</span>
        </DialogFormFullWidth>
      </DialogFormGrid>,
    );

    expect(screen.getByText('First field')).toBeInTheDocument();
    expect(screen.getByText('Wide field')).toBeInTheDocument();
  });
});
