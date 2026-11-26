import { useState, type DragEvent } from 'react';

/**
 * Drag-to-reorder state of a short list: which row is dragged, which one the
 * pointer is over, and the three drag handlers. `onReorder` gets the source
 * and target index when a row is dropped on another.
 */
export function useOptionDrag(onReorder: (from: number, to: number) => void) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const endDrag = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  const onDragStart = (event: DragEvent<HTMLElement>, index: number) => {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(index));
    const row = event.currentTarget.closest<HTMLElement>('li');
    if (row) {
      event.dataTransfer.setDragImage(row, 0, 0);
    }
    setDragIndex(index);
  };

  const onDragOver = (event: DragEvent<HTMLElement>, index: number) => {
    if (dragIndex !== null) {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      setOverIndex(index);
    }
  };

  const onDrop = (event: DragEvent<HTMLElement>, index: number) => {
    if (dragIndex === null) {
      return;
    }
    event.preventDefault();
    const from = dragIndex;
    endDrag();
    onReorder(from, index);
  };

  return { dragIndex, overIndex, onDragStart, onDragOver, onDrop, endDrag };
}
