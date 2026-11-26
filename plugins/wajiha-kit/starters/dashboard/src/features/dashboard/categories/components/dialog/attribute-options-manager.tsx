import { useSingleFlight } from '@/hooks/use-single-flight';
import { useAttributeDefinitionDetail } from '../../hooks/query/use-attribute-definitions';
import { useSaveAttributeOptions } from '../../hooks/query/use-attribute-mutations';
import type { OptionChanges } from '../../utils/option-order';
import { AttributeOptionsDialog } from './attribute-options-dialog';

interface AttributeOptionsManagerProps {
  attributeId: string;
  onClose: () => void;
}

/**
 * The options editor of one attribute, used by both pages (the attributes
 * list and the category's assignments). Loads the definition by id and saves
 * the session's changes together. Render with `key` = attributeId.
 */
export function AttributeOptionsManager({
  attributeId,
  onClose,
}: AttributeOptionsManagerProps) {
  const detail = useAttributeDefinitionDetail(attributeId);
  const save = useSaveAttributeOptions();
  const flight = useSingleFlight();

  const onSave = (changes: OptionChanges) => {
    // Single-flight: a second click while the batch runs sends nothing.
    if (!flight.start()) {
      return;
    }
    save.mutate(
      { definitionId: attributeId, changes },
      { onSuccess: onClose, onSettled: flight.end },
    );
  };

  return (
    <AttributeOptionsDialog
      open
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      attribute={detail.data ?? null}
      isPending={save.isPending}
      onSave={onSave}
    />
  );
}
