import { describe, expect, it } from 'vitest';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen } from '@/test/render';
import { DataBadge } from './data-badge';

describe('DataBadge', () => {
  it('maps a semantic tone onto its badge class', () => {
    renderWithProviders(<DataBadge tone="success">Done</DataBadge>);
    const badge = screen.getByText('Done');
    expect(badge).toHaveClass('badge', 'badge-green', 'badge-pill');
  });

  it('renders a dot inside pill-shaped badges by default', () => {
    renderWithProviders(
      <DataBadge tone="success" shape="pill">
        Approved
      </DataBadge>,
    );
    const badge = screen.getByText('Approved');
    expect(badge).toHaveClass('badge-pill');
    expect(badge.querySelector('.badge-dot')).not.toBeNull();
  });

  it('renders a pill with a dot when shape is omitted', () => {
    renderWithProviders(<DataBadge tone="success">Approved</DataBadge>);
    const badge = screen.getByText('Approved');
    expect(badge).toHaveClass('badge-pill');
    expect(badge.querySelector('.badge-dot')).not.toBeNull();
  });

  it('omits the dot on tag-shaped badges unless asked', () => {
    renderWithProviders(
      <DataBadge tone="info" shape="tag">
        Draft
      </DataBadge>,
    );
    expect(screen.getByText('Draft').querySelector('.badge-dot')).toBeNull();
  });

  it('marks a dotted pill as an untinted status badge', () => {
    renderWithProviders(<DataBadge tone="warning">Pending</DataBadge>);
    expect(screen.getByText('Pending')).toHaveClass('badge-status');
  });

  it('keeps the tinted container on chips without a dot and on tags', () => {
    renderWithProviders(
      <>
        <DataBadge tone="info" dot={false}>
          Chip
        </DataBadge>
        <DataBadge tone="info" shape="tag">
          Tag
        </DataBadge>
      </>,
    );
    expect(screen.getByText('Chip')).not.toHaveClass('badge-status');
    expect(screen.getByText('Tag')).not.toHaveClass('badge-status');
  });

  it('maps the brand tone onto the badge-brand class', () => {
    renderWithProviders(<DataBadge tone="brand">Brand</DataBadge>);
    expect(screen.getByText('Brand')).toHaveClass('badge-brand');
  });

  it('applies the badge-neutral class for the neutral tone', () => {
    renderWithProviders(<DataBadge tone="neutral">Cancelled</DataBadge>);
    const badge = screen.getByText('Cancelled');
    expect(badge).toHaveClass('badge-neutral');
  });

  it('renders the status variant as a pill with a dot', () => {
    renderWithProviders(<DataBadge variant="status" active />);
    const badge = screen.getByText(tt('ui.active'));
    expect(badge).toHaveClass('badge-green', 'badge-pill');
    expect(badge.querySelector('.badge-dot')).not.toBeNull();
  });

  it('maps the warning and info tones onto their badge classes', () => {
    renderWithProviders(
      <>
        <DataBadge tone="warning">Pending</DataBadge>
        <DataBadge tone="info">Active</DataBadge>
      </>,
    );
    expect(screen.getByText('Pending')).toHaveClass('badge-orange');
    expect(screen.getByText('Active')).toHaveClass('badge-blue');
  });

  it('renders the inactive status variant as a neutral pill with a dot', () => {
    renderWithProviders(<DataBadge variant="status" active={false} />);
    const badge = screen.getByText('Inactive');
    expect(badge).toHaveClass('badge-neutral', 'badge-pill');
    expect(badge.querySelector('.badge-dot')).not.toBeNull();
  });

  it('renders the English label for the status variant', () => {
    renderWithProviders(<DataBadge variant="status" active />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders the Arabic label when the language is ar', async () => {
    await setTestLanguage('ar');
    renderWithProviders(
      <>
        <DataBadge variant="status" active />
        <DataBadge variant="status" active={false} />
      </>,
    );
    expect(screen.getByText('نشط')).toBeInTheDocument();
    expect(screen.getByText('غير نشط')).toBeInTheDocument();
  });
});
