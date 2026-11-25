import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '@/test/render';
import { TabPanel, Tabs, type TabItem } from './tabs';

const items: TabItem<'a' | 'b' | 'c'>[] = [
  { id: 'a', label: 'Alpha' },
  { id: 'b', label: 'Beta', disabled: true },
  { id: 'c', label: 'Gamma' },
];

function Harness({
  onChange,
  initial = 'a',
}: {
  onChange?: (id: 'a' | 'b' | 'c') => void;
  initial?: 'a' | 'c';
}) {
  const [value, setValue] = useState<'a' | 'b' | 'c'>(initial);
  return (
    <>
      <Tabs
        items={items}
        value={value}
        onValueChange={(id) => {
          setValue(id);
          onChange?.(id);
        }}
        aria-label="Sections"
      />
      <TabPanel active={value === 'a'} value="a">
        Alpha body
      </TabPanel>
      <TabPanel active={value === 'c'} value="c">
        Gamma body
      </TabPanel>
    </>
  );
}

afterEach(() => {
  document.documentElement.dir = '';
});

describe('Tabs', () => {
  it('renders one tabpanel for the active tab, labelled by that tab', () => {
    renderWithProviders(<Harness />);
    const panel = screen.getByRole('tabpanel');
    const tab = screen.getByRole('tab', { name: 'Alpha' });
    expect(panel).toHaveTextContent('Alpha body');
    expect(tab).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', tab.id);
  });

  it('links only the active tab to a panel (inactive tabs have no aria-controls)', () => {
    renderWithProviders(<Harness />);
    expect(screen.getByRole('tab', { name: 'Gamma' })).not.toHaveAttribute(
      'aria-controls',
    );
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute(
      'aria-controls',
    );
  });

  it('gives tabIndex 0 only to the active tab (roving tabindex)', () => {
    renderWithProviders(<Harness />);
    expect(screen.getByRole('tab', { name: 'Alpha' })).toHaveAttribute(
      'tabindex',
      '0',
    );
    expect(screen.getByRole('tab', { name: 'Gamma' })).toHaveAttribute(
      'tabindex',
      '-1',
    );
  });

  it('moves with ArrowRight, skipping disabled tabs, and reports the change', async () => {
    const onChange = vi.fn();
    const { user } = renderWithProviders(<Harness onChange={onChange} />);
    screen.getByRole('tab', { name: 'Alpha' }).focus();
    await user.keyboard('{ArrowRight}');
    expect(onChange).toHaveBeenCalledWith('c');
    expect(screen.getByRole('tab', { name: 'Gamma' })).toHaveFocus();
  });

  it('moves with ArrowLeft in RTL, since the arrow direction flips', async () => {
    document.documentElement.dir = 'rtl';
    const onChange = vi.fn();
    const { user } = renderWithProviders(
      <Harness onChange={onChange} initial="c" />,
    );
    screen.getByRole('tab', { name: 'Gamma' }).focus();
    await user.keyboard('{ArrowLeft}');
    expect(onChange).toHaveBeenCalledWith('a');
  });

  it('jumps to the first and last enabled tab with Home and End', async () => {
    const onChange = vi.fn();
    const { user } = renderWithProviders(<Harness onChange={onChange} />);
    screen.getByRole('tab', { name: 'Alpha' }).focus();
    await user.keyboard('{End}');
    expect(onChange).toHaveBeenLastCalledWith('c');
    await user.keyboard('{Home}');
    expect(onChange).toHaveBeenLastCalledWith('a');
  });

  it('never selects a disabled tab', () => {
    renderWithProviders(<Harness />);
    expect(screen.getByRole('tab', { name: 'Beta' })).toBeDisabled();
  });
});

describe('TabPanel', () => {
  it('renders nothing when inactive', () => {
    renderWithProviders(
      <TabPanel active={false} value="a">
        hidden
      </TabPanel>,
    );
    expect(screen.queryByRole('tabpanel')).not.toBeInTheDocument();
  });
});

describe('Tabs variants', () => {
  it('renders the plain-text variant on its own track class', () => {
    renderWithProviders(
      <Tabs
        variant="plain"
        items={items}
        value="a"
        onValueChange={vi.fn()}
        aria-label="Sections"
      />,
    );

    const list = screen.getByRole('tablist', { name: 'Sections' });
    expect(list).toHaveClass('tabs-track', 'tabs-track-plain');
    expect(list).toHaveAttribute('data-variant', 'plain');
  });

  it('keeps the pill track by default and shows the count chip', () => {
    renderWithProviders(
      <Tabs
        items={[{ id: 'a', label: 'Pending', count: 8 }]}
        value="a"
        onValueChange={vi.fn()}
        aria-label="Inbox"
      />,
    );

    const list = screen.getByRole('tablist', { name: 'Inbox' });
    expect(list).not.toHaveClass('tabs-track-plain');
    expect(screen.getByRole('tab', { name: /Pending/ })).toHaveTextContent('8');
  });
});
