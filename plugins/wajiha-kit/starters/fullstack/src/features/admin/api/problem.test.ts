import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { describe, expect, it } from 'vitest';
import { apiErrorMessage } from './errors';
import { parseApiProblem } from './problem';

/** An error the way axios raises it for an HTTP answer with this status and body. */
function httpError(status: number, data: unknown): AxiosError {
  const config = { headers: {} } as InternalAxiosRequestConfig;
  const response = { status, statusText: '', headers: {}, config, data } as AxiosResponse;
  return new AxiosError('failed', AxiosError.ERR_BAD_REQUEST, config, null, response);
}

describe('parseApiProblem', () => {
  it('reads Spring default errors: the message when there is one, nothing when it is empty', () => {
    const body = { timestamp: '2026-01-01', status: 409, error: 'Conflict', path: '/suppliers' };
    expect(parseApiProblem(httpError(409, { ...body, message: 'Code already used' }))).toEqual({
      status: 409,
      message: 'Code already used',
      fields: {},
    });
    expect(parseApiProblem(httpError(409, { ...body, message: '' }))).toEqual({
      status: 409,
      message: undefined,
      fields: {},
    });
  });

  it('reads RFC 9457 Problem Details: the detail, never the generic title', () => {
    const problem = parseApiProblem(
      httpError(409, { type: 'about:blank', title: 'Conflict', status: 409, detail: 'Code taken' }),
    );
    expect(problem.message).toBe('Code taken');
  });

  it('reads a Spring validation list: field and defaultMessage', () => {
    const problem = parseApiProblem(
      httpError(400, {
        message: 'Validation failed',
        errors: [
          { field: 'code', defaultMessage: 'must not be blank' },
          { field: 'code', defaultMessage: 'a second message for the same field' },
          { field: 'email', defaultMessage: 'must be a valid email' },
        ],
      }),
    );
    expect(problem).toEqual({
      status: 400,
      message: 'Validation failed',
      fields: { code: 'must not be blank', email: 'must be a valid email' },
    });
  });

  it('reads Problem Details with an errors list of { field, message } on a 422', () => {
    const problem = parseApiProblem(
      httpError(422, { title: 'Unprocessable', errors: [{ field: 'name', message: 'too short' }] }),
    );
    expect(problem).toEqual({ status: 422, message: undefined, fields: { name: 'too short' } });
  });

  it('reads a map of field errors, also under "fieldErrors", with a list of texts per field', () => {
    expect(
      parseApiProblem(httpError(400, { errors: { code: 'taken', name: ['required', 'short'] } }))
        .fields,
    ).toEqual({ code: 'taken', name: 'required' });
    expect(
      parseApiProblem(
        httpError(400, { fieldErrors: [{ property: 'phone', reason: 'bad format' }] }),
      ).fields,
    ).toEqual({ phone: 'bad format' });
  });

  it('ignores entries it cannot read, and field errors on other statuses', () => {
    expect(
      parseApiProblem(httpError(400, { errors: [null, 'x', { field: 'a' }, { message: 'b' }] }))
        .fields,
    ).toEqual({});
    expect(
      parseApiProblem(httpError(500, { errors: [{ field: 'code', message: 'x' }] })).fields,
    ).toEqual({});
  });

  it('copes with a body that is not an object, and with errors that are not HTTP errors', () => {
    expect(parseApiProblem(httpError(502, '<html>Bad gateway</html>'))).toEqual({
      status: 502,
      message: undefined,
      fields: {},
    });
    expect(parseApiProblem(new Error('boom'))).toEqual({
      status: undefined,
      message: undefined,
      fields: {},
    });
    expect(parseApiProblem(undefined).status).toBeUndefined();
  });
});

describe('apiErrorMessage with Spring bodies', () => {
  it('shows the backend text, or a text chosen by status when there is none', () => {
    expect(apiErrorMessage(httpError(409, { message: '', error: 'Conflict' }))).toEqual({
      key: 'adminErrors.conflict',
    });
    expect(apiErrorMessage(httpError(409, { detail: 'Code taken' }))).toEqual({
      text: 'Code taken',
    });
  });

  it('falls back to the first field error when the body has no sentence of its own', () => {
    expect(
      apiErrorMessage(
        httpError(400, { errors: [{ field: 'code', defaultMessage: 'must not be blank' }] }),
      ),
    ).toEqual({ text: 'must not be blank' });
  });

  it('keeps the generic text for a title-only Problem Details body', () => {
    expect(apiErrorMessage(httpError(400, { title: 'Bad Request' }))).toEqual({
      key: 'adminErrors.generic',
    });
  });
});
