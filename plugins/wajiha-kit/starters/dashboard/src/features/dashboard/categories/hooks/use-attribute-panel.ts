import type { UseQueryResult } from '@tanstack/react-query';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCan } from '@/components/auth/can';
import type { AttributeDefinitionResponse } from '@/types/api/catalog';
import type { Column } from '@/types/table';
import { getAttributeDefinitionColumns } from '../components/attribute-definition-columns';
import type { AttributeFormDialogProps } from '../components/dialog/attribute-form-dialog';
import type { AttributeOptionsDialogProps } from '../components/dialog/attribute-options-dialog';
import type { OptionChanges } from '../utils/option-order';
import type { AttributeDefinitionFormValues } from '../validations/validations';
import { toAttributeDefinitionPayload } from '../validations/validations';
import { getAttributeAccess } from './attribute-actions';
import type { CategoriesConfirmTarget } from './confirm-target';
import { useAttributeFilters } from './filter/use-attribute-filters';
import { useAttributeFormDialog } from './form/use-attribute-form-dialog';
import { useAttributeOptionsDialog } from './form/use-attribute-options-dialog';
import { useAttributeDefinitionsList } from './query/use-attribute-definitions';
import {
  useCreateAttributeDefinition,
  useDeleteAttributeDefinition,
  useSaveAttributeOptions,
  useUpdateAttributeDefinition,
} from './query/use-attribute-mutations';

export interface AttributePanel {
  filters: ReturnType<typeof useAttributeFilters>;
  query: UseQueryResult<AttributeDefinitionResponse[]>;
  rows: AttributeDefinitionResponse[];
  /** Unfiltered definitions, used for lookups (attach list, dialogs). */
  definitions: AttributeDefinitionResponse[];
  columns: Column<AttributeDefinitionResponse>[];
  attributeDialog: AttributeFormDialogProps;
  optionsDialog: AttributeOptionsDialogProps;
  openOptionsFor: (id: string) => void;
  onAddAttribute: () => void;
  removeAttribute: (id: string, close: () => void) => void;
  isDeletingAttribute: boolean;
  canWrite: boolean;
  canDelete: boolean;
}

export function useAttributePanel({
  requestDelete,
}: {
  requestDelete: (target: CategoriesConfirmTarget) => void;
}): AttributePanel {
  const { t } = useTranslation();
  const filters = useAttributeFilters();
  const query = useAttributeDefinitionsList(filters.params);
  const lookupQuery = useAttributeDefinitionsList({});
  const rows = useMemo(() => query.data ?? [], [query.data]);
  const definitions = useMemo(() => lookupQuery.data ?? [], [lookupQuery.data]);

  const attributeDialog = useAttributeFormDialog();
  const optionsDialog = useAttributeOptionsDialog();
  const createAttribute = useCreateAttributeDefinition();
  const updateAttribute = useUpdateAttributeDefinition();
  const deleteAttribute = useDeleteAttributeDefinition();
  const saveOptions = useSaveAttributeOptions();

  const attributeId = attributeDialog.attributeId;
  const editingAttribute =
    definitions.find((definition) => definition.id === attributeId) ?? null;
  const optionsAttributeId = optionsDialog.attributeId;
  const optionsAttribute =
    definitions.find((definition) => definition.id === optionsAttributeId) ??
    null;

  const access = getAttributeAccess(useCan());
  const canWrite = access.update;
  const canDelete = access.delete;
  const { openEdit: openAttributeEdit } = attributeDialog;
  const { openFor: openOptionsFor } = optionsDialog;

  const columns = useMemo(
    () =>
      getAttributeDefinitionColumns({
        t,
        canWrite,
        canDelete,
        onEdit: (row) => {
          openAttributeEdit(row.id);
        },
        onEditOptions: (row) => {
          openOptionsFor(row.id);
        },
        onDelete: (row) => {
          requestDelete({
            kind: 'attribute',
            id: row.id,
            name: row.name ?? '',
          });
        },
      }),
    [t, canWrite, canDelete, openAttributeEdit, openOptionsFor, requestDelete],
  );

  const onSubmitAttribute = (values: AttributeDefinitionFormValues) => {
    const payload = toAttributeDefinitionPayload(values);
    if (attributeId !== null) {
      updateAttribute.mutate(
        { id: attributeId, payload },
        {
          onSuccess: () => {
            attributeDialog.close();
          },
        },
      );
      return;
    }
    createAttribute.mutate(payload, {
      onSuccess: () => {
        attributeDialog.close();
      },
    });
  };

  const onSaveOptions = (changes: OptionChanges) => {
    if (optionsAttributeId === null) {
      return;
    }
    saveOptions.mutate(
      { definitionId: optionsAttributeId, changes },
      {
        onSuccess: () => {
          optionsDialog.close();
        },
      },
    );
  };

  return {
    filters,
    query,
    rows,
    definitions,
    columns,
    canWrite,
    canDelete,
    attributeDialog: {
      open: attributeDialog.open,
      onOpenChange: attributeDialog.onOpenChange,
      attribute: editingAttribute,
      isPending: createAttribute.isPending || updateAttribute.isPending,
      onSubmit: onSubmitAttribute,
    },
    optionsDialog: {
      open: optionsDialog.open,
      onOpenChange: optionsDialog.onOpenChange,
      attribute: optionsAttribute,
      isPending: saveOptions.isPending,
      onSave: onSaveOptions,
    },
    openOptionsFor,
    onAddAttribute: () => {
      attributeDialog.openCreate();
    },
    removeAttribute: (id: string, close: () => void) => {
      deleteAttribute.mutate(id, { onSuccess: close });
    },
    isDeletingAttribute: deleteAttribute.isPending,
  };
}
