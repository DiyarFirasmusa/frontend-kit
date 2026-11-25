import { http, HttpResponse } from 'msw';
import { describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { serveDirectoryNames } from '@/test/msw/directory';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithProviders, screen, waitFor } from '@/test/render';
import { PersonName } from './person-name';

const USER_A = '6f1d2c3a-0000-4000-8000-000000000001';
const USER_B = '6f1d2c3a-0000-4000-8000-000000000002';
const ORG_UNIT = '9b8a7c6d-0000-4000-8000-000000000020';

function serveEntry(): void {
  server.use(
    http.post(api(endpoints.directory.resolve), () =>
      HttpResponse.json([
        {
          id: USER_A,
          name: 'Sara Ali',
          avatarUrl: null,
          subtitle: 'Storekeeper · Baghdad branch',
          employmentStatus: 'On duty',
        },
      ]),
    ),
  );
}

describe('PersonName', () => {
  it('shows the short id until the name arrives, with the full id as title', async () => {
    serveDirectoryNames({ [USER_A]: 'Sara Ali' });
    renderWithProviders(<PersonName id={USER_A} />);
    expect(screen.getByText('6f1d2c3a')).toHaveAttribute('title', USER_A);
    expect(await screen.findByText('Sara Ali')).toHaveAttribute(
      'title',
      USER_A,
    );
  });

  it('keeps the short id when the directory does not know the id', async () => {
    const bodies = serveDirectoryNames({});
    renderWithProviders(<PersonName id={USER_A} />);
    await waitFor(() => {
      expect(bodies).toHaveLength(1);
    });
    expect(screen.getByText('6f1d2c3a')).toBeInTheDocument();
  });

  it('shows a name the caller already has without a lookup', () => {
    const bodies = serveDirectoryNames({ [USER_A]: 'Other Name' });
    renderWithProviders(<PersonName id={USER_A} name="Sara Ali" />);
    expect(screen.getByText('Sara Ali')).toHaveAttribute('title', USER_A);
    expect(bodies).toHaveLength(0);
  });

  it('renders an em dash for an empty id', () => {
    renderWithProviders(<PersonName id={null} />);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('resolves several names on one screen with one request', async () => {
    const bodies = serveDirectoryNames({
      [USER_A]: 'Sara Ali',
      [USER_B]: 'Omar Hadi',
      [ORG_UNIT]: 'Logistics',
    });
    renderWithProviders(
      <ul>
        <li>
          <PersonName id={USER_A} />
        </li>
        <li>
          <PersonName id={USER_B} />
        </li>
        <li>
          <PersonName id={ORG_UNIT} kind="orgUnit" />
        </li>
      </ul>,
    );
    expect(await screen.findByText('Sara Ali')).toBeInTheDocument();
    expect(screen.getByText('Omar Hadi')).toBeInTheDocument();
    expect(screen.getByText('Logistics')).toBeInTheDocument();
    expect(bodies).toEqual([
      { userIds: [USER_A, USER_B], orgUnitIds: [ORG_UNIT] },
    ]);
  });

  describe('with directory details', () => {
    it('shows the subtitle and employment status when asked for', async () => {
      serveEntry();
      renderWithProviders(<PersonName id={USER_A} showSubtitle showStatus />);
      expect(await screen.findByText('Sara Ali')).toBeInTheDocument();
      expect(
        screen.getByText('Storekeeper · Baghdad branch'),
      ).toBeInTheDocument();
      expect(screen.getByText('On duty')).toBeInTheDocument();
    });

    it('renders only the name by default', async () => {
      serveEntry();
      renderWithProviders(<PersonName id={USER_A} />);
      expect(await screen.findByText('Sara Ali')).toBeInTheDocument();
      expect(screen.queryByText('Storekeeper · Baghdad branch')).toBeNull();
      expect(screen.queryByText('On duty')).toBeNull();
    });
  });
});
