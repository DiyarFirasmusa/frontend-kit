import { useMemo } from 'react';
import type { SelectOption } from '@/components/fields/select-option';
import { useSingleFlight } from '@/hooks/use-single-flight';
import { useAttributeLookup } from '../../hooks/query/use-attribute-definitions';
import { useAttachCategoryAttribute } from '../../hooks/query/use-category-mutations';
import type { AttachAttributeFormValues } from '../../validations/validations';
import { AttachAttributeDialog } from './attach-attribute-dialog';

interface AttachAttributeManagerProps {
  categoryId: string;
  /** Attribute definitions already linked (own or inherited): not offered again. */
  linkedIds: ReadonlySet<string>;
  /** Where the new link goes in the category's order. */
  sortOrder: number;
  onClose: () => void;
}

/** Links an active attribute to a category. Render with `key` = categoryId. */
export function AttachAttributeManager({
  categoryId,
  linkedIds,
  sortOrder,
  onClose,
}: AttachAttributeManagerProps) {
  const lookup = useAttributeLookup(true);
  const attach = useAttachCategoryAttribute(categoryId);
  const flight = useSingleFlight();

  const attributeOptions = useMemo<SelectOption[]>(
    () =>
      (lookup.data?.content ?? [])
        .filter((definition) => !linkedIds.has(definition.id))
        .map((definition) => ({
          value: definition.id,
          label: `${definition.name ?? ''} (${definition.code ?? ''})`,
        })),
    [lookup.data, linkedIds],
  );

  const onSubmit = (values: AttachAttributeFormValues) => {
    // Single-flight: a second click while the request runs sends nothing.
    if (!flight.start()) {
      return;
    }
    attach.mutate(
      {
        attributeDefinitionId: values.attributeDefinitionId,
        isRequired: values.isRequired,
        isVariantAxis: values.isVariantAxis,
        sortOrder,
      },
      { onSuccess: onClose, onSettled: flight.end },
    );
  };

  return (
    <AttachAttributeDialog
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      attributeOptions={attributeOptions}
      isPending={attach.isPending}
      onSubmit={onSubmit}
    />
  );
}
