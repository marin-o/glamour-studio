import 'server-only';

const RATE_REASONS = new Set(['rateLimitExceeded', 'userRateLimitExceeded', 'quotaExceeded', 'dailyLimitExceeded']);

export class GoogleCalendarError extends Error {
  constructor(code, message, { retryable = false, status, operation } = {}) {
    super(message); this.name = 'GoogleCalendarError'; this.code = code; this.retryable = retryable;
    if (status !== undefined) this.status = status;
    if (operation !== undefined) this.operation = operation;
  }
  toJSON() { return { name: this.name, code: this.code, message: this.message, retryable: this.retryable, ...(this.operation ? { operation: this.operation } : {}) }; }
}

async function googleReason(response) {
  if (response.status !== 403) return null;
  try {
    const payload = await response.clone().json();
    const reason = payload?.error?.errors?.[0]?.reason ?? payload?.error?.reason;
    return typeof reason === 'string' && reason.length <= 64 ? reason : null;
  } catch { return null; }
}

export async function googleErrorFromResponse(response, operation) {
  const status = response.status;
  const context = operation ? { operation } : {};
  if (status === 403 && RATE_REASONS.has(await googleReason(response))) return new GoogleCalendarError('RATE_LIMITED', 'Google Calendar is temporarily rate limited.', { retryable: true, status, ...context });
  if (status === 401 || status === 403) return new GoogleCalendarError('AUTHORIZATION_FAILED', 'Google Calendar authorization failed.', { status, ...context });
  if (status === 404) return new GoogleCalendarError('NOT_FOUND', 'The Google Calendar resource was not found.', { status, ...context });
  if (status === 409) return new GoogleCalendarError('CONFLICT', 'The Google Calendar resource already exists or conflicts.', { status, ...context });
  if (status === 429) return new GoogleCalendarError('RATE_LIMITED', 'Google Calendar is temporarily rate limited.', { retryable: true, status, ...context });
  if (status >= 500) return new GoogleCalendarError('GOOGLE_UNAVAILABLE', 'Google Calendar is temporarily unavailable.', { retryable: true, status, ...context });
  return new GoogleCalendarError('GOOGLE_REQUEST_FAILED', 'Google Calendar rejected the request.', { status, ...context });
}
