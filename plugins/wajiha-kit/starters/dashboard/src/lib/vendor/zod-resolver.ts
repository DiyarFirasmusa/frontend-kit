import type { FieldValues, Resolver } from 'react-hook-form';
import type { ZodType } from 'zod';

export function zodResolver<T extends FieldValues>(
  schema: ZodType<T>,
): Resolver<T> {
  return ((values: T) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }

    const errors: Record<string, unknown> = {};
    for (const issue of result.error.issues) {
      let target = errors;
      for (let i = 0; i < issue.path.length - 1; i++) {
        const key = String(issue.path[i]);
        if (
          typeof target[key] !== 'object' ||
          target[key] === null ||
          'type' in (target[key] as object)
        ) {
          target[key] = {};
        }
        target = target[key] as Record<string, unknown>;
      }
      const last = String(issue.path.at(-1) ?? '');
      if (last && !(last in target)) {
        target[last] = { type: issue.code, message: issue.message };
      }
    }

    return { values: {}, errors };
  }) as Resolver<T>;
}
