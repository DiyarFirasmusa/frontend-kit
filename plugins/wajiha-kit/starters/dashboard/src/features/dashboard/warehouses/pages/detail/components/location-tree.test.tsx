import { beforeAll, describe, expect, it } from 'vitest';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen } from '@/test/render';
import { makeLocation } from '../../../warehouse-test-utils';
import { buildLocationTree } from '../utils/location-tree';
import { LocationTree } from './location-tree';

const locations = [
  makeLocation({ id: 'zone', code: 'ZONE-A', name: 'Storage hall A' }),
  makeLocation({
    id: 'rack',
    code: 'RACK-1',
    name: 'Rack one',
    parentId: 'zone',
  }),
  makeLocation({
    id: 'bin',
    code: 'BIN-9',
    name: null,
    parentId: 'rack',
    isActive: false,
    isBlocked: true,
  }),
];

function renderTree() {
  return renderWithProviders(
    <LocationTree nodes={buildLocationTree(locations)} />,
  );
}

describe('LocationTree', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/warehouses');
  });

  it('renders only the top-level zones with their sub-location count in English', () => {
    renderTree();

    expect(screen.getByText('Storage hall A')).toBeInTheDocument();
    expect(screen.queryByText('Rack one')).not.toBeInTheDocument();
    expect(
      screen.getByText(tt('warehouses.locations.childCount', { count: 2 })),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(1);
  });

  it('renders the status and blocked badges of a zone', () => {
    renderWithProviders(
      <LocationTree
        nodes={buildLocationTree([
          makeLocation({ id: 'z', name: 'Quarantine', isBlocked: true }),
        ])}
      />,
    );

    expect(
      screen.getByText(tt('warehouses.locations.blocked')),
    ).toBeInTheDocument();
    expect(screen.getByText(tt('common.active'))).toBeInTheDocument();
  });

  it('renders the Arabic labels when the language is Arabic', async () => {
    await setTestLanguage('ar');
    renderTree();

    expect(
      screen.getByText(tt('warehouses.locations.childCount', { count: 2 })),
    ).toBeInTheDocument();
  });

  it('renders an em dash for an empty name', () => {
    renderWithProviders(
      <LocationTree
        nodes={buildLocationTree([
          makeLocation({ id: 'blank', name: '', code: '' }),
        ])}
      />,
    );

    expect(screen.getByText('—')).toBeInTheDocument();
  });
});
