import { cn } from '@/lib/utils';

type ClassValue = string | undefined | null | false;
type VariantMap = Record<string, Record<string, ClassValue>>;

type VariantInput<V extends VariantMap> = {
  [K in keyof V]?: keyof V[K];
} & { className?: string };

export type VariantProps<T> = T extends (props?: infer P) => string
  ? Omit<NonNullable<P>, 'className'>
  : never;

export function variants<V extends VariantMap>(
  base: ClassValue,
  config: {
    variants: V;
    defaultVariants?: { [K in keyof V]?: keyof V[K] };
  },
) {
  return function build(props?: VariantInput<V>): string {
    const classes: ClassValue[] = [base];

    for (const key of Object.keys(config.variants) as (keyof V)[]) {
      const picked =
        (props?.[key] as string | undefined) ??
        (config.defaultVariants?.[key] as string | undefined);
      if (picked) {
        const map = config.variants[key];
        const cls = map?.[picked];
        if (cls) {
          classes.push(cls);
        }
      }
    }

    if (props?.className) {
      classes.push(props.className);
    }

    return cn(...classes);
  };
}
