import { renderHook } from '@testing-library/react';
import {
  AxiosError,
  CanceledError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { useToastStore } from '@/shared/store/toast-store';
import { parseApiProblem } from '../api/problem';
import { applyFieldErrors, reportSaveError } from './apply-field-errors';

type Values = { code: string; name: string };
const NAMES = ['code', 'name'] as const;

function httpError(status: number, data: unknown): AxiosError {
  const config = { headers: {} } as InternalAxiosRequestConfig;
  const response = { status, statusText: '', headers: {}, config, data } as AxiosResponse;
  return new AxiosError('failed', AxiosError.ERR_BAD_REQUEST, config, null, response);
}

function setup() {
  return renderHook(() => useForm<Values>({ defaultValues: { code: '', name: '' } })).result
    .current;
}

describe('applyFieldErrors', () => {
  it('sets the error of every field the form has and returns what found no input', () => {
    const form = setup();
    const problem = parseApiProblem(
      httpError(400, {
        errors: [
          { field: 'code', message: 'taken' },
          { field: 'ghost', message: 'no such input' },
        ],
      }),
    );
    expect(applyFieldErrors(form, problem, NAMES)).toEqual(['no such input']);
    expect(form.getFieldState('code').error).toMatchObject({ type: 'server', message: 'taken' });
    expect(form.getFieldState('name').error).toBeUndefined();
  });
});

describe('reportSaveError', () => {
  it('shows field errors under the inputs and toasts nothing', () => {
    const form = setup();
    reportSaveError(form, httpError(409, { errors: { code: 'taken' } }), NAMES);
    expect(form.getFieldState('code').error?.message).toBe('taken');
    expect(useToastStore.getState().toasts).toEqual([]);
  });

  it('toasts the error when no field can show it', () => {
    const form = setup();
    reportSaveError(form, httpError(409, { message: 'Warehouse closed' }), NAMES);
    reportSaveError(form, httpError(400, { errors: [{ field: 'ghost', message: 'x' }] }), NAMES);
    expect(useToastStore.getState().toasts.map((toast) => toast.message)).toEqual([
      { text: 'Warehouse closed' },
      { text: 'x' },
    ]);
  });

  it('toasts a network error by its generic key', () => {
    reportSaveError(setup(), new Error('offline'), NAMES);
    expect(useToastStore.getState().toasts.map((toast) => toast.message)).toEqual([
      { key: 'adminErrors.network' },
    ]);
  });

  it('ignores a cancelled request', () => {
    const cancelled = new CanceledError('cancelled');
    reportSaveError(setup(), cancelled, NAMES);
    expect(useToastStore.getState().toasts).toEqual([]);
  });
});
