import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { toast } from '@/shared/store/toast-store';
import { apiErrorMessage, isCancelled } from '../api/errors';
import { parseApiProblem, type ApiProblem } from '../api/problem';

/**
 * Puts the backend's field errors under the inputs of a form. Only names the form really has are used
 * (a backend can blame a field this screen does not show). The first field with an error gets the focus.
 * Returns the problems that found no input, so the caller can still show them (a toast).
 */
export function applyFieldErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
  problem: ApiProblem,
  names: readonly Path<T>[],
): string[] {
  const unplaced: string[] = [];
  let focused = false;
  for (const [field, message] of Object.entries(problem.fields)) {
    const name = names.find((candidate) => candidate === field);
    if (name === undefined) {
      unplaced.push(message);
    } else {
      form.setError(name, { type: 'server', message }, { shouldFocus: !focused });
      focused = true;
    }
  }
  return unplaced;
}

/**
 * What a form does when its save fails (the request was sent with `silentError: true`): the backend's
 * field errors go under their inputs and nothing else is shown; with no field to blame, the error is
 * toasted like any other. A cancelled request is not an error.
 */
export function reportSaveError<T extends FieldValues>(
  form: UseFormReturn<T>,
  error: unknown,
  names: readonly Path<T>[],
): void {
  if (isCancelled(error)) {
    return;
  }
  const problem = parseApiProblem(error);
  const unplaced = applyFieldErrors(form, problem, names);
  if (Object.keys(problem.fields).length === unplaced.length) {
    toast.error(apiErrorMessage(error));
  }
}
