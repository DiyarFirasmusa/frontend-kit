import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '@/test/render';
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip';

describe('Tooltip', () => {
  it('shows the tooltip copy when the trigger is hovered', async () => {
    const { user } = renderWithProviders(
      <Tooltip>
        <TooltipTrigger>Export</TooltipTrigger>
        <TooltipContent>Export as CSV</TooltipContent>
      </Tooltip>,
    );
    await user.hover(screen.getByRole('button', { name: 'Export' }));
    expect(await screen.findByText('Export as CSV')).toBeInTheDocument();
  });

  it('keeps the copy out of the DOM until the trigger is hovered', () => {
    renderWithProviders(
      <Tooltip>
        <TooltipTrigger>Export</TooltipTrigger>
        <TooltipContent>Export as CSV</TooltipContent>
      </Tooltip>,
    );
    expect(screen.queryByText('Export as CSV')).not.toBeInTheDocument();
  });
});
