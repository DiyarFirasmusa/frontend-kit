import { act } from '@testing-library/react';
import { toast } from 'sonner';
import { afterEach, describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '@/test/render';
import { Toaster } from './sonner';

describe('Toaster', () => {
  afterEach(() => {
    act(() => {
      toast.dismiss();
    });
  });

  it('renders a toast raised through sonner', async () => {
    renderWithProviders(<Toaster />);
    act(() => {
      toast.success('Warehouse saved');
    });
    expect(await screen.findByText('Warehouse saved')).toBeInTheDocument();
  });
});
