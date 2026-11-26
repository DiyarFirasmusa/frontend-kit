import { privateApi } from '../api/client';
import { endpoints } from '../api/endpoints';

/**
 * Tells the backend the session is over. The token is passed explicitly: the request interceptor reads
 * it when the request is SENT, which is after the local session was cleared, and a real backend can only
 * revoke a session it can identify. Failing is fine (the local session is gone either way), so it never
 * throws and never toasts.
 */
export async function logout(token: string | null): Promise<void> {
  try {
    await privateApi.post(endpoints.auth.logout, null, {
      silentError: true,
      ...(token === null ? {} : { headers: { Authorization: `Bearer ${token}` } }),
    });
  } catch {
    // Nothing to do: see above.
  }
}
