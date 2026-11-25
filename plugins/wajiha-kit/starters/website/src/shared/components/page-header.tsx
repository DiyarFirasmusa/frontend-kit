import type { ReactNode } from 'react';
import { Container } from '@/shared/components/container';

/** The top of an inner page: the one h1 and a short lead. */
export function PageHeader({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children?: ReactNode;
}) {
  return (
    <div className="border-border bg-surface-sunken py-section border-b">
      <Container>
        <h1 className="text-text text-4xl">{title}</h1>
        {lead === undefined ? null : <p className="text-muted mt-4 max-w-prose text-lg">{lead}</p>}
        {children}
      </Container>
    </div>
  );
}
