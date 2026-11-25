import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '@/components/dialog/confirm-dialog';
import { AuditLogButton } from '@/components/shared/audit-log-button';
import { Breadcrumb, BreadcrumbLink } from '@/components/shared/breadcrumb';
import { PageHeader } from '@/components/shared/page-header';
import { DataBadge } from '@/components/table/data-badge';
import { Button } from '@/components/ui/button';
import { TabPanel, Tabs, type TabItem } from '@/components/ui/tabs';
import { Wrapper } from '@/components/wrapper/loading-wrapper';
import { AUDIT_ENTITY } from '@/constants/audit-entities';
import { RecordNotFound } from '@/features/fallback/record-not-found';
import { Pencil, Trash2 } from '@/lib/icons';
import { WarehouseFormDialog } from '../../components/dialog/warehouse-form-dialog';
import { LocationsTab } from './components/locations-tab';
import { MembersTab } from './components/members-tab';
import { OverviewTab } from './components/overview-tab';
import { useWarehouseDetailPage } from './hooks/use-detail-page';
import { WAREHOUSE_DETAIL_TABS, type WarehouseDetailTab } from './types/types';

interface Props {
  warehouseId: string;
  tab: WarehouseDetailTab;
}

const TAB_LABEL_KEYS: Record<WarehouseDetailTab, string> = {
  overview: 'warehouses.detail.tabs.overview',
  members: 'warehouses.detail.tabs.members',
  locations: 'warehouses.detail.tabs.locations',
};

export default function WarehouseDetailContainer({ warehouseId, tab }: Props) {
  const { t } = useTranslation();
  const page = useWarehouseDetailPage(warehouseId, tab);
  const tabItems: TabItem<WarehouseDetailTab>[] = WAREHOUSE_DETAIL_TABS.map(
    (id) => ({ id, label: t(TAB_LABEL_KEYS[id]) }),
  );

  if (page.isNotFound) {
    return (
      <RecordNotFound
        recordType={t('warehouses.detail.recordType')}
        requestedId={warehouseId}
        onBackToList={page.onBack}
        onHome={page.onHome}
      />
    );
  }

  return (
    <section dir={page.dir} className="gap-card flex flex-col">
      <PageHeader
        breadcrumb={
          <Breadcrumb current={t('warehouses.detail.breadcrumb')}>
            <BreadcrumbLink to="/warehouses">
              {t('warehouses.title')}
            </BreadcrumbLink>
          </Breadcrumb>
        }
        title={page.title}
        subtitle={page.subtitle}
        badge={
          page.isTransit ? (
            <DataBadge tone="info" shape="pill">
              {t('warehouses.type.transitBadge')}
            </DataBadge>
          ) : undefined
        }
        actions={
          <>
            <Button type="button" variant="outline" onClick={page.onBack}>
              {t('warehouses.detail.back')}
            </Button>
            <AuditLogButton
              entity={AUDIT_ENTITY.warehouse}
              entityId={warehouseId}
            />
            {page.canEdit ? (
              <Button type="button" variant="outline" onClick={page.onEdit}>
                <Pencil className="size-4" />
                {t('warehouses.actions.edit')}
              </Button>
            ) : null}
            {page.canDelete ? (
              <Button
                type="button"
                variant="destructive"
                onClick={page.deleteDialog.onOpen}
              >
                <Trash2 className="size-4" />
                {t('warehouses.actions.delete')}
              </Button>
            ) : null}
          </>
        }
      />

      <Tabs
        variant="plain"
        items={tabItems}
        value={tab}
        onValueChange={page.onTabChange}
        aria-label={t('warehouses.detail.tabsLabel')}
      />

      <TabPanel active={tab === 'overview'} value="overview">
        <Wrapper
          isLoading={page.detailState.isLoading}
          isError={page.detailState.isError}
          error={page.detailState.error}
          data={page.detailState.data}
          emptyMessage={t('warehouses.detail.notFound')}
          onRetry={page.detailState.onRetry}
        >
          {(warehouse) => <OverviewTab warehouse={warehouse} />}
        </Wrapper>
      </TabPanel>

      <TabPanel active={tab === 'members'} value="members">
        <MembersTab warehouseId={warehouseId} />
      </TabPanel>

      <TabPanel active={tab === 'locations'} value="locations">
        <LocationsTab warehouseId={warehouseId} />
      </TabPanel>

      <WarehouseFormDialog dialog={page.formDialog} />

      <ConfirmDialog
        open={page.deleteDialog.open}
        onOpenChange={page.deleteDialog.onOpenChange}
        title={t('warehouses.delete.title')}
        description={t('warehouses.delete.description', {
          name: page.deleteDialog.name,
        })}
        confirmLabel={t('warehouses.delete.confirm')}
        destructive
        isLoading={page.deleteDialog.isPending}
        onConfirm={page.deleteDialog.onConfirm}
      />
    </section>
  );
}
