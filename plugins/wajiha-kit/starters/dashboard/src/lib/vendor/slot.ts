import {
  Children,
  cloneElement,
  isValidElement,
  type HTMLAttributes,
  type ReactElement,
  type Ref,
} from 'react';
import { cn } from '@/lib/utils';

type SlotProps = HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode;
  ref?: Ref<HTMLElement>;
};

interface ChildProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Slot({ children, className, style, ref, ...rest }: SlotProps) {
  const child = Children.only(children);

  if (!isValidElement<ChildProps>(child)) {
    return null;
  }

  const childProps = child.props;

  return cloneElement<ChildProps & { ref?: Ref<HTMLElement> }>(
    child as ReactElement<ChildProps & { ref?: Ref<HTMLElement> }>,
    {
      ...rest,
      ...childProps,
      className: cn(className, childProps.className),
      style: { ...style, ...childProps.style },
      ref,
    },
  );
}
