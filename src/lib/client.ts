// Shared HTTP client for Oathe API calls.
// Uses process.env instead of import.meta.env (incompatible with Node.js CLI).

const BASE_URL = (() => {
  const raw = process.env.OATHE_API_BASE?.trim() ?? '';
  if (raw) {
    try {
      new URL(raw);
    } catch {
      throw new Error(`OATHE_API_BASE is not a valid URL: "${raw}"`);
    }
    return raw.replace(/\/$/, '');
  }
  return 'https://audit-engine.oathe.ai';
})();

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Fetch wrapper for Oathe API. Adds 30s timeout, handles network errors,
 * and parses both current `{ error }` and future `{ message }` error formats.
 */
export async function apiFetch(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const url = `${BASE_URL}${path}`;

  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      signal: init?.signal ?? AbortSignal.timeout(30_000),
      headers: {
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'TimeoutError') {
      throw new ApiError(
        'Request timed out after 30 seconds. The API may be temporarily unavailable.',
        0,
      );
    }
    if (err instanceof TypeError) {
      throw new ApiError(
        `Network error: unable to reach API at ${BASE_URL}. Check your connection or OATHE_API_BASE setting.`,
        0,
      );
    }
    throw err;
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const message = body.message ?? body.error ?? 'Unknown error';
    throw new ApiError(message, res.status);
  }

  return res;
}
