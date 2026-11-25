import { expect, it } from 'vitest';
import { Breadcrumb, BreadcrumbLink } from '@/components/shared/breadcrumb';
import { renderWithRouter, renderWithProviders, screen } from '@/test/render';
import { PageHeader } from './page-header';

it('renders the title as the only h1 with its subtitle and actions', () => {
  renderWithProviders(
    <PageHeader
      title="Employees"
      subtitle="All staff"
      actions={<button type="button">Add</button>}
    />,
  );

  expect(
    screen.getByRole('heading', { level: 1, name: 'Employees' }),
  ).toBeInTheDocument();
  expect(screen.getByText('All staff')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Add' })).toBeInTheDocument();
});

it('omits the subtitle and actions when they are not given', () => {
  const { container } = renderWithProviders(<PageHeader title="Settings" />);

  expect(screen.queryByRole('button')).not.toBeInTheDocument();
  expect(container.querySelector('header p')).toBeNull();
});

it('renders the breadcrumb trail above the title', async () => {
  await renderWithRouter(
    <PageHeader
      title="Disburse"
      breadcrumb={
        <Breadcrumb current="Disburse">
          <BreadcrumbLink to="/">Home</BreadcrumbLink>
        </Breadcrumb>
      }
    />,
    { path: '/' },
  );

  const nav = screen.getByRole('navigation');
  const heading = screen.getByRole('heading', { level: 1, name: 'Disburse' });
  expect(screen.getByRole('link', { name: 'Home' })).toBeInTheDocument();
  expect(
    nav.compareDocumentPosition(heading) & Node.DOCUMENT_POSITION_FOLLOWING,
  ).toBeTruthy();
});

it('renders no accent bar beside the title', () => {
  renderWithProviders(<PageHeader title="Settings" />);

  const heading = screen.getByRole('heading', { level: 1, name: 'Settings' });
  expect(heading).toHaveTextContent(/^Settings$/);
  expect(heading.querySelector('span')).toBeNull();
});

it('renders a badge beside the title', () => {
  renderWithProviders(
    <PageHeader title="Main warehouse" badge={<span>Transit</span>} />,
  );

  expect(
    screen.getByRole('heading', { level: 1, name: 'Main warehouse' }),
  ).toBeInTheDocument();
  expect(screen.getByText('Transit')).toBeInTheDocument();
});
